import { getGmailClient } from "./client";

export interface Label {
  id: string;
  name: string;
  type: "system" | "user";
  messageListVisibility?: string | null;
  labelListVisibility?: string | null;
}

/**
 * List all labels in the user's mailbox
 */
export async function listLabels(): Promise<Label[]> {
  const gmail = await getGmailClient();

  const response = await gmail.users.labels.list({
    userId: "me",
  });

  return (
    response.data.labels?.map((label) => ({
      id: label.id!,
      name: label.name!,
      type: label.type as "system" | "user",
      messageListVisibility: label.messageListVisibility,
      labelListVisibility: label.labelListVisibility,
    })) || []
  );
}

/**
 * Create a new label
 */
export async function createLabel(name: string): Promise<Label> {
  const gmail = await getGmailClient();

  const response = await gmail.users.labels.create({
    userId: "me",
    requestBody: {
      name,
      labelListVisibility: "labelShow",
      messageListVisibility: "show",
    },
  });

  return {
    id: response.data.id!,
    name: response.data.name!,
    type: "user",
  };
}

/**
 * Ensure a label exists by name; returns its id. Creates it if missing.
 */
export async function ensureLabel(name: string): Promise<Label> {
  const labels = await listLabels();
  const existing = labels.find((l) => l.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  return await createLabel(name);
}

/**
 * Get a label by ID
 */
export async function getLabel(labelId: string): Promise<Label> {
  const gmail = await getGmailClient();

  const response = await gmail.users.labels.get({
    userId: "me",
    id: labelId,
  });

  return {
    id: response.data.id!,
    name: response.data.name!,
    type: response.data.type as "system" | "user",
  };
}

/**
 * Delete a label (user labels only)
 */
export async function deleteLabel(labelId: string): Promise<void> {
  const gmail = await getGmailClient();

  await gmail.users.labels.delete({
    userId: "me",
    id: labelId,
  });
}
