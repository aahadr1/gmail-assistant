import * as gmailMessages from "@/lib/gmail/messages";
import * as gmailLabels from "@/lib/gmail/labels";
import { SearchFilters } from "@/lib/gmail/queries";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { verifyMessagesAgainstRequest } from "@/lib/ai/verify";

/**
 * Log an action to the audit log
 */
async function logAudit(
  action: string,
  status: "success" | "error" | "pending",
  metadata?: any,
  errorDetail?: string,
  target?: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return;

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action,
      status,
      metadata,
      errorDetail,
      target,
    },
  });
}

/**
 * Tool definitions for the AI agent
 */
export const tools = [
  {
    type: "function" as const,
    function: {
      name: "searchAndVerifyMessages",
      description:
        "Search Gmail using one or more Gmail query strings (paged up to 1000), fetch metadata for all candidates, then run an AI verification step to keep only relevant emails. Returns a verificationRunId and the verified message ids.",
      parameters: {
        type: "object",
        properties: {
          userRequest: { type: "string", description: "The original user request to verify against" },
          queries: {
            type: "array",
            items: { type: "string" },
            description:
              "One or more Gmail query strings (use AND/OR, quotes). The results are unioned and deduped.",
          },
          maxResults: {
            type: "number",
            description: "Max total unique messages to consider (default 1000, max 1000)",
          },
        },
        required: ["userRequest", "queries"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "searchMessages",
      description: "Search for emails in Gmail using filters like keywords, sender, date range, etc. Returns message IDs.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Keywords to search for in email content",
          },
          from: {
            type: "string",
            description: "Filter by sender email address",
          },
          to: {
            type: "string",
            description: "Filter by recipient email address",
          },
          subject: {
            type: "string",
            description: "Filter by subject line",
          },
          afterDate: {
            type: "string",
            description: "Only show emails after this date (YYYY/MM/DD or YYYY-MM-DD)",
          },
          beforeDate: {
            type: "string",
            description: "Only show emails before this date (YYYY/MM/DD or YYYY-MM-DD)",
          },
          hasAttachment: {
            type: "boolean",
            description: "Filter for emails with attachments",
          },
          maxResults: {
            type: "number",
            description: "Maximum number of results to return (default 50, max 1000)",
          },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getMessages",
      description: "Get full details of specific emails by their IDs. Returns subject, sender, body, etc.",
      parameters: {
        type: "object",
        properties: {
          messageIds: {
            type: "array",
            items: { type: "string" },
            description: "Array of message IDs to retrieve",
          },
        },
        required: ["messageIds"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "listLabels",
      description: "List all available Gmail labels (folders) including system labels (INBOX, SENT, etc.) and user-created labels",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "createLabel",
      description: "Create a new Gmail label (folder) for organizing emails",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the label to create",
          },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "ensureLabel",
      description:
        "Find a Gmail label by name (case-insensitive) and create it if it doesn't exist. Returns the label id and name.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Label name to ensure exists (e.g. \"WATRIN\")",
          },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "applyLabels",
      description: "Add or remove labels from specific emails. Use this to organize emails into folders.",
      parameters: {
        type: "object",
        properties: {
          verificationRunId: {
            type: "string",
            description:
              "If provided, the server will ONLY apply labels to the verified ids stored in that verification run (ignores messageIds).",
          },
          messageIds: {
            type: "array",
            items: { type: "string" },
            description: "Array of message IDs to modify",
          },
          addLabelIds: {
            type: "array",
            items: { type: "string" },
            description: "Label IDs to add to these messages",
          },
          removeLabelIds: {
            type: "array",
            items: { type: "string" },
            description: "Label IDs to remove from these messages",
          },
          confirm: {
            type: "boolean",
            description: "Must be true to execute bulk modifications.",
          },
        },
        required: ["messageIds"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "archiveMessages",
      description: "Archive emails (remove from inbox but keep in All Mail)",
      parameters: {
        type: "object",
        properties: {
          messageIds: {
            type: "array",
            items: { type: "string" },
            description: "Array of message IDs to archive",
          },
        },
        required: ["messageIds"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "trashMessages",
      description: "Move emails to trash",
      parameters: {
        type: "object",
        properties: {
          messageIds: {
            type: "array",
            items: { type: "string" },
            description: "Array of message IDs to trash",
          },
        },
        required: ["messageIds"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "sendEmail",
      description: "Send an email. REQUIRES USER CONFIRMATION before executing.",
      parameters: {
        type: "object",
        properties: {
          to: {
            type: "array",
            items: { type: "string" },
            description: "Array of recipient email addresses",
          },
          subject: {
            type: "string",
            description: "Email subject line",
          },
          bodyText: {
            type: "string",
            description: "Plain text body of the email",
          },
          bodyHtml: {
            type: "string",
            description: "HTML body of the email (optional)",
          },
          cc: {
            type: "array",
            items: { type: "string" },
            description: "CC recipients (optional)",
          },
          bcc: {
            type: "array",
            items: { type: "string" },
            description: "BCC recipients (optional)",
          },
        },
        required: ["to", "subject", "bodyText"],
      },
    },
  },
];

/**
 * Execute a tool call
 */
export async function executeTool(toolName: string, args: any): Promise<any> {
  try {
    switch (toolName) {
      case "searchAndVerifyMessages": {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) throw new Error("Unauthorized");

        const userRequest: string = args.userRequest;
        const queries: string[] = Array.isArray(args.queries) ? args.queries : [];
        const maxResults = Math.min(Number(args.maxResults || 1000), 1000);

        const allIds: string[] = [];
        for (const q of queries.slice(0, 5)) {
          if (!q || typeof q !== "string") continue;
          const { messageIds } = await gmailMessages.searchMessages({ query: q }, maxResults);
          allIds.push(...messageIds);
          if (new Set(allIds).size >= maxResults) break;
        }

        // Deduplicate and cap
        const seen = new Set<string>();
        const candidateIds = allIds.filter((id) => {
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        }).slice(0, maxResults);

        const candidates = await gmailMessages.getMessagesMetadata(candidateIds, 10);
        const verification = await verifyMessagesAgainstRequest({ userRequest, candidates });

        const sample = JSON.parse(JSON.stringify(candidates.slice(0, 10)));

        const run = await (prisma as any).verificationRun.create({
          data: {
            userId: session.user.id,
            userRequest,
            gmailQueries: queries,
            candidateMessageIds: candidateIds,
            candidateCount: candidateIds.length,
            verifiedMessageIds: verification.verifiedIds,
            verifiedCount: verification.verifiedIds.length,
            rejectedMessageIds: verification.rejectedIds,
            rejectedCount: verification.rejectedIds.length,
            unsureMessageIds: verification.unsureIds,
            unsureCount: verification.unsureIds.length,
            verificationNotes: verification.notes,
            sample,
          },
        });

        await logAudit("search_verify", "success", { queries, maxResults, runId: run.id, counts: { candidates: candidateIds.length, verified: verification.verifiedIds.length } });

        return {
          verificationRunId: run.id,
          candidateCount: candidateIds.length,
          verifiedCount: verification.verifiedIds.length,
          rejectedCount: verification.rejectedIds.length,
          unsureCount: verification.unsureIds.length,
          verifiedMessageIds: verification.verifiedIds,
          rejectedMessageIds: verification.rejectedIds,
          unsureMessageIds: verification.unsureIds,
          notes: verification.notes,
          sample: candidates.slice(0, 10),
        };
      }

      case "searchMessages": {
        const filters: SearchFilters = {
          query: args.query,
          from: args.from,
          to: args.to,
          subject: args.subject,
          after: args.afterDate,
          before: args.beforeDate,
          hasAttachment: args.hasAttachment,
        };
        const maxResults = Math.min(args.maxResults || 50, 1000);
        
        const result = await gmailMessages.searchMessages(filters, maxResults);
        
        await logAudit("search", "success", { filters, maxResults }, undefined, undefined);
        
        return result;
      }

      case "getMessages": {
        const { messageIds } = args;
        const messages = await gmailMessages.getMessages(messageIds);
        
        await logAudit("read", "success", { count: messages.length }, undefined, messageIds.join(","));
        
        return messages;
      }

      case "listLabels": {
        const labels = await gmailLabels.listLabels();
        
        await logAudit("list_labels", "success", { count: labels.length });
        
        return labels;
      }

      case "createLabel": {
        const { name } = args;
        const label = await gmailLabels.createLabel(name);
        
        await logAudit("create_label", "success", { name }, undefined, label.id);
        
        return label;
      }

      case "ensureLabel": {
        const { name } = args;
        const label = await gmailLabels.ensureLabel(name);
        await logAudit("ensure_label", "success", { name }, undefined, label.id);
        return label;
      }

      case "applyLabels": {
        let { messageIds } = args;
        const { addLabelIds, removeLabelIds } = args;

        // Enforce verification for large batches even if user passes messageIds.
        if (!args.verificationRunId && Array.isArray(messageIds) && messageIds.length > 20) {
          return {
            requiresVerification: true,
            message:
              "Bulk labeling requires verification first. Run searchAndVerifyMessages, then applyLabels with verificationRunId.",
          };
        }

        // If verificationRunId is provided, ONLY allow labeling verified ids from that run.
        if (args.verificationRunId) {
          const session = await getServerSession(authOptions);
          if (!session?.user?.id) throw new Error("Unauthorized");

          const run = await (prisma as any).verificationRun.findFirst({
            where: { id: args.verificationRunId, userId: session.user.id },
          });
          if (!run) throw new Error("Invalid verificationRunId");

          messageIds = (run.verifiedMessageIds as any as string[]) || [];
        }

        // Hard safety: require explicit confirmation for bulk modifications
        if (args?.confirm !== true) {
          return {
            requiresConfirmation: true,
            message:
              "About to modify labels on emails. Please confirm by replying exactly: CONFIRM",
            proposed: { messageIds, addLabelIds, removeLabelIds, verificationRunId: args.verificationRunId },
          };
        }

        await gmailMessages.modifyMessageLabels(messageIds, addLabelIds, removeLabelIds);

        // Verify (best-effort): check a small sample actually contains the added label
        let verification: any = null;
        if (addLabelIds && addLabelIds.length > 0) {
          try {
            verification = await gmailMessages.verifyLabelApplied(messageIds, addLabelIds[0], 3);
          } catch (e) {
            verification = { error: e instanceof Error ? e.message : String(e) };
          }
        }
        console.log("applyLabels verification:", verification);

        await logAudit(
          "modify_labels",
          "success",
          { addLabelIds, removeLabelIds, verification },
          undefined,
          messageIds.join(",")
        );

        return {
          success: true,
          modifiedCount: messageIds.length,
          verification,
        };
      }

      case "archiveMessages": {
        const { messageIds } = args;
        await gmailMessages.archiveMessages(messageIds);
        
        await logAudit("archive", "success", { count: messageIds.length }, undefined, messageIds.join(","));
        
        return { success: true, archivedCount: messageIds.length };
      }

      case "trashMessages": {
        const { messageIds } = args;
        await gmailMessages.trashMessages(messageIds);
        
        await logAudit("trash", "success", { count: messageIds.length }, undefined, messageIds.join(","));
        
        return { success: true, trashedCount: messageIds.length };
      }

      case "sendEmail": {
        const { to, cc, bcc, subject, bodyText, bodyHtml } = args;
        const result = await gmailMessages.sendEmail({
          to,
          cc,
          bcc,
          subject,
          bodyText,
          bodyHtml,
        });
        
        await logAudit("send", "success", { to, subject }, undefined, result.id);
        
        return result;
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await logAudit(toolName, "error", args, errorMessage);
    throw error;
  }
}
