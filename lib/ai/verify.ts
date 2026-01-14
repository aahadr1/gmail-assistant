import OpenAI from "openai";
import type { MessageMetadata } from "@/lib/gmail/messages";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");
  return new OpenAI({ apiKey });
}

export interface VerificationResult {
  verifiedIds: string[];
  rejectedIds: string[];
  unsureIds: string[];
  notes: string;
}

function extractKeywords(userRequest: string): string[] {
  const kw = new Set<string>();
  // quoted phrases
  for (const m of userRequest.matchAll(/"([^"]+)"/g)) {
    const v = m[1]?.trim();
    if (v) kw.add(v);
  }
  // uppercase-ish tokens (names)
  for (const token of userRequest.split(/[\s,;:.()]+/)) {
    const t = token.trim();
    if (!t) continue;
    if (/^[A-ZÀ-Ü][A-ZÀ-Ü0-9_-]{3,}$/.test(t)) kw.add(t);
  }
  return Array.from(kw).slice(0, 10);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Verify relevance in chunks to avoid token explosions (hundreds of emails).
 * We feed {id, from, subject, date, snippet} and ask the model to mark in-scope.
 */
export async function verifyMessagesAgainstRequest(params: {
  userRequest: string;
  candidates: MessageMetadata[];
}): Promise<VerificationResult> {
  const openai = getOpenAI();
  const extractedKeywords = extractKeywords(params.userRequest);

  const batches = chunk(params.candidates, 50);
  const verified = new Set<string>();
  const rejected = new Set<string>();
  const unsure = new Set<string>();
  const notes: string[] = [];

  for (const batch of batches) {
    const prompt = {
      role: "system" as const,
      content:
        "You are verifying whether emails are relevant to a user's request.\n" +
        "Return ONLY valid JSON with keys: verifiedIds, rejectedIds, unsureIds, notes.\n" +
        "Rules:\n" +
        "- The user request is in French. Use it as ground truth.\n" +
        "- Prefer RECALL over precision: if an email likely matches, put it in verifiedIds.\n" +
        "- If it's clearly unrelated, put it in rejectedIds.\n" +
        "- If you can't tell from subject/snippet, put it in unsureIds.\n" +
        "- A strong signal: the email subject/snippet contains any of the extracted keywords (case-insensitive).\n" +
        "- verifiedIds/rejectedIds must be subsets of the provided ids.\n",
    };

    const user = {
      role: "user" as const,
      content: JSON.stringify(
        {
          userRequest: params.userRequest,
          extractedKeywords,
          emails: batch.map((m) => ({
            id: m.id,
            from: m.from,
            subject: m.subject,
            date: m.date,
            snippet: m.snippet,
          })),
        },
        null,
        2
      ),
    };

    const res = await openai.chat.completions.create({
      model: MODEL,
      messages: [prompt, user],
      temperature: 0,
      response_format: { type: "json_object" } as any,
    });

    const content = res.choices[0]?.message?.content || "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      // If the model failed JSON, reject all in this batch to be safe.
      for (const m of batch) rejected.add(m.id);
      notes.push("Model returned invalid JSON for a batch; rejected batch for safety.");
      continue;
    }

    const batchIds = new Set(batch.map((m) => m.id));
    const verifiedIds: string[] = Array.isArray(parsed.verifiedIds) ? parsed.verifiedIds : [];
    const rejectedIds: string[] = Array.isArray(parsed.rejectedIds) ? parsed.rejectedIds : [];
    const unsureIds: string[] = Array.isArray(parsed.unsureIds) ? parsed.unsureIds : [];

    for (const id of verifiedIds) if (batchIds.has(id)) verified.add(id);
    for (const id of rejectedIds) if (batchIds.has(id)) rejected.add(id);
    for (const id of unsureIds) if (batchIds.has(id)) unsure.add(id);

    if (typeof parsed.notes === "string" && parsed.notes.trim()) notes.push(parsed.notes.trim());
  }

  // If an id is both, keep it rejected (safer)
  for (const id of rejected) verified.delete(id);
  for (const id of rejected) unsure.delete(id);

  return {
    verifiedIds: Array.from(verified),
    rejectedIds: Array.from(rejected),
    unsureIds: Array.from(unsure),
    notes: notes.join("\n"),
  };
}

