import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";
import { tools, executeTool } from "@/lib/ai/tools";
import { prisma } from "@/lib/db/prisma";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing. Set it in your environment variables.");
  }
  return new OpenAI({ apiKey });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, conversationId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Create or get conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
    }
    
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          title: messages[0]?.content?.substring(0, 100) || "New Conversation",
        },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: messages[messages.length - 1].content,
      },
    });

    // System message to guide the AI
    const systemMessage = {
      role: "system" as const,
      content: `You are a helpful Gmail assistant. You can search emails, read them, organize them with labels, archive/trash messages, and send emails on behalf of the user.

Key guidelines:
- For multi-email requests, ALWAYS use searchAndVerifyMessages (NOT searchMessages) so results are verified before any action.
- When searching emails, prefer multiple tighter Gmail queries instead of one broad OR query.
- After searchAndVerifyMessages, only operate on verified ids (use verificationRunId for follow-up actions).
- ALWAYS include verificationRunId in your response whenever searchAndVerifyMessages (or a confirmation proposal) returns one.
- Always organize results clearly (by date, sender, or topic)
- Before sending emails or making destructive changes (trash/delete), explain what you're about to do
- Be concise but thorough in your responses
- NEVER claim an action succeeded unless the tool result confirms success, and include counts.
- For label/apply/archive/trash, prefer to mention the verification result if provided by the tool.
- If a tool fails or returns an error, say so plainly and ask the user to reconnect/enable APIs instead of guessing.
- Avoid overly-broad Gmail queries. If a term is common (e.g. \"COUR\"), combine it with more specific terms using AND, not a standalone OR.
- For bulk labeling: first show a small sample (subjects/senders/dates) and ask the user to reply CONFIRM. Then call applyLabels with confirm=true and include verificationRunId.
- Respond in a structured way with these sections and IDs:
  1) SearchPlan (gmailQueries[])
  2) VerificationSummary (verificationRunId, candidateCount, verifiedCount, rejectedCount)
  3) SampleVerified (up to 10 items with id, date, from, subject)
  4) NextActions (what you can do next, requiring confirmation if modifying)
- Format dates clearly and handle year-based searches (e.g., "2022" means after:2022/01/01 before:2023/01/01)`,
    };

    const currentMessages = [systemMessage, ...messages];
    let iterations = 0;
    const MAX_ITERATIONS = 10;
    let finalResponse = "";
    let lastVerificationRunId: string | null = null;
    let lastProposedAction: any = null;

    // Tool calling loop
    const openai = getOpenAI();
    
    while (iterations < MAX_ITERATIONS) {
      iterations++;

      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: currentMessages,
        tools: tools as any,
        tool_choice: "auto",
      });

      const choice = completion.choices[0];
      const message = choice.message;

      // Add assistant message to history
      currentMessages.push(message);

      // If no tool calls, we're done
      if (!message.tool_calls || message.tool_calls.length === 0) {
        finalResponse = message.content || "I couldn't process that request.";
        break;
      }

      // Execute tool calls
      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        console.log(`Executing tool: ${toolName}`, toolArgs);

        try {
          const result = await executeTool(toolName, toolArgs);
          if (result?.verificationRunId && typeof result.verificationRunId === "string") {
            lastVerificationRunId = result.verificationRunId;
          }
          if (result?.requiresConfirmation && result?.proposed) {
            lastProposedAction = result.proposed;
            if (result.proposed?.verificationRunId && typeof result.proposed.verificationRunId === "string") {
              lastVerificationRunId = result.proposed.verificationRunId;
            }
          }

          // Add tool response to messages
          currentMessages.push({
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        } catch (error) {
          console.error(`Tool execution error (${toolName}):`, error);
          
          currentMessages.push({
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              error: error instanceof Error ? error.message : "Tool execution failed",
            }),
          });
        }
      }
    }

    // If we have important IDs/pending actions, make sure the user sees them so the next turn can reference them.
    if (finalResponse) {
      const shouldAppendVerificationRunId =
        lastVerificationRunId && !finalResponse.toLowerCase().includes("verificationrunid");
      const shouldAppendPending =
        lastProposedAction && !finalResponse.toLowerCase().includes("pendingaction");

      if (shouldAppendVerificationRunId || shouldAppendPending) {
        finalResponse += `\n\n---\n`;
      }
      if (shouldAppendVerificationRunId) {
        finalResponse += `VerificationRunId: ${lastVerificationRunId}\n`;
      }
      if (shouldAppendPending) {
        finalResponse += `PendingAction (use this exact payload on CONFIRM):\n${JSON.stringify(
          lastProposedAction,
          null,
          2
        )}\n`;
      }
    }

    // Save assistant response
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: finalResponse,
      },
    });

    return NextResponse.json({
      message: finalResponse,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
