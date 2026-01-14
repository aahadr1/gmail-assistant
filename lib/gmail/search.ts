import { getGmailClient } from "./client";

/**
 * Gmail list has per-call maxResults limits; we page until we hit maxTotal.
 * Gmail API maxResults supports up to 500 per call.
 */
export async function listMessageIdsByQuery(
  q: string,
  maxTotal: number = 1000
): Promise<{ messageIds: string[]; resultSizeEstimate: number }> {
  const gmail = await getGmailClient();

  const messageIds: string[] = [];
  let pageToken: string | undefined = undefined;
  let resultSizeEstimate = 0;

  while (messageIds.length < maxTotal) {
    const remaining = maxTotal - messageIds.length;
    const maxResults = Math.min(500, remaining);

    const res = (await gmail.users.messages.list({
      userId: "me",
      q,
      maxResults,
      pageToken,
    })) as any;

    resultSizeEstimate = res.data.resultSizeEstimate || resultSizeEstimate;
    const ids = (res.data.messages || [])
      .map((m: any) => m.id)
      .filter((id: any): id is string => Boolean(id));

    messageIds.push(...ids);

    pageToken = res.data.nextPageToken || undefined;
    if (!pageToken || ids.length === 0) break;
  }

  // Deduplicate while preserving order
  const seen = new Set<string>();
  const unique = messageIds.filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return { messageIds: unique.slice(0, maxTotal), resultSizeEstimate };
}

