import { getGmailClient } from "./client";
import { parseHeaders, extractTextBody, extractAttachments, buildRFC2822Message, encodeBase64Url, EmailMessage } from "./mime";
import { buildGmailQuery, SearchFilters } from "./queries";
import { listMessageIdsByQuery } from "./search";

export interface ParsedMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
  labels: string[];
  attachments: Array<{
    filename: string;
    mimeType: string;
    size: number;
  }>;
}

/**
 * Search for messages matching the given filters
 */
export async function searchMessages(
  filters: SearchFilters,
  maxResults: number = 50
): Promise<{ messageIds: string[]; resultSizeEstimate: number }> {
  const query = buildGmailQuery(filters);

  const capped = Math.min(maxResults, 1000);
  if (!query) return { messageIds: [], resultSizeEstimate: 0 };
  return await listMessageIdsByQuery(query, capped);
}

/**
 * Get a single message by ID with full details
 */
export async function getMessage(messageId: string): Promise<ParsedMessage> {
  const gmail = await getGmailClient();

  const response = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const message = response.data;
  const headers = parseHeaders(message.payload?.headers);

  return {
    id: message.id!,
    threadId: message.threadId!,
    from: headers["from"] || "",
    to: headers["to"] || "",
    subject: headers["subject"] || "(No Subject)",
    date: headers["date"] || "",
    snippet: message.snippet || "",
    body: extractTextBody(message.payload),
    labels: message.labelIds || [],
    attachments: extractAttachments(message.payload),
  };
}

export interface MessageMetadata {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  snippet: string;
}

/**
 * Get lightweight metadata (headers + snippet). This is used for verification,
 * because full body for hundreds of messages can be too heavy.
 */
export async function getMessageMetadata(messageId: string): Promise<MessageMetadata> {
  const gmail = await getGmailClient();

  const response = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "metadata",
    metadataHeaders: ["From", "To", "Subject", "Date"],
  });

  const message = response.data;
  const headers = parseHeaders(message.payload?.headers);

  return {
    id: message.id!,
    threadId: message.threadId!,
    from: headers["from"] || "",
    to: headers["to"] || "",
    subject: headers["subject"] || "(No Subject)",
    date: headers["date"] || "",
    snippet: message.snippet || "",
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length) as any;
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const current = idx++;
      results[current] = await fn(items[current]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function getMessagesMetadata(messageIds: string[], concurrency: number = 10): Promise<MessageMetadata[]> {
  const ids = messageIds.slice(0, 1000);
  const metas = await mapWithConcurrency(ids, concurrency, async (id) => {
    try {
      return await getMessageMetadata(id);
    } catch {
      return null as any;
    }
  });
  return metas.filter(Boolean);
}

/**
 * Get multiple messages in batch
 */
export async function getMessages(messageIds: string[]): Promise<ParsedMessage[]> {
  // Gmail API doesn't have a true batch endpoint, so we'll do parallel requests
  // In production, consider rate limiting this
  const messages = await Promise.all(
    messageIds.slice(0, 50).map((id) => getMessage(id).catch(() => null))
  );

  return messages.filter((m): m is ParsedMessage => m !== null);
}

/**
 * Modify message labels (add/remove)
 */
export async function modifyMessageLabels(
  messageIds: string[],
  addLabelIds?: string[],
  removeLabelIds?: string[]
): Promise<void> {
  const gmail = await getGmailClient();

  // Gmail API supports batch modify
  await gmail.users.messages.batchModify({
    userId: "me",
    requestBody: {
      ids: messageIds,
      addLabelIds,
      removeLabelIds,
    },
  });
}

/**
 * Fetch labelIds for a message (lightweight: metadata only)
 */
export async function getMessageLabelIds(messageId: string): Promise<string[]> {
  const gmail = await getGmailClient();
  const response = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "metadata",
  });

  return response.data.labelIds || [];
}

/**
 * Verify that a label was applied to a sample of messages.
 * Returns how many in the sample contain the label.
 */
export async function verifyLabelApplied(
  messageIds: string[],
  labelId: string,
  sampleSize: number = 3
): Promise<{ sampleSize: number; verifiedCount: number; sample: Array<{ id: string; hasLabel: boolean; labels: string[] }> }> {
  const sampleIds = messageIds.slice(0, Math.max(0, sampleSize));
  const sample = await Promise.all(
    sampleIds.map(async (id) => {
      const labels = await getMessageLabelIds(id);
      return { id, hasLabel: labels.includes(labelId), labels };
    })
  );

  const verifiedCount = sample.filter((s) => s.hasLabel).length;
  return { sampleSize: sample.length, verifiedCount, sample };
}

/**
 * Archive messages (remove INBOX label)
 */
export async function archiveMessages(messageIds: string[]): Promise<void> {
  await modifyMessageLabels(messageIds, undefined, ["INBOX"]);
}

/**
 * Move messages to trash (add TRASH label)
 */
export async function trashMessages(messageIds: string[]): Promise<void> {
  await modifyMessageLabels(messageIds, ["TRASH"], undefined);
}

/**
 * Mark messages as read (remove UNREAD label)
 */
export async function markAsRead(messageIds: string[]): Promise<void> {
  await modifyMessageLabels(messageIds, undefined, ["UNREAD"]);
}

/**
 * Mark messages as unread (add UNREAD label)
 */
export async function markAsUnread(messageIds: string[]): Promise<void> {
  await modifyMessageLabels(messageIds, ["UNREAD"], undefined);
}

/**
 * Send an email
 */
export async function sendEmail(message: EmailMessage): Promise<{ id: string; threadId: string }> {
  const gmail = await getGmailClient();

  const raw = buildRFC2822Message(message);
  const encodedMessage = encodeBase64Url(raw);

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  return {
    id: response.data.id!,
    threadId: response.data.threadId!,
  };
}
