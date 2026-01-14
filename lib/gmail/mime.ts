import { gmail_v1 } from "googleapis";

/**
 * Parse email headers to extract common fields
 */
export function parseHeaders(headers: gmail_v1.Schema$MessagePartHeader[] | undefined) {
  const result: Record<string, string> = {};
  
  if (!headers) return result;
  
  for (const header of headers) {
    if (header.name && header.value) {
      result[header.name.toLowerCase()] = header.value;
    }
  }
  
  return result;
}

/**
 * Extract plain text body from a Gmail message
 */
export function extractTextBody(payload: gmail_v1.Schema$MessagePart | undefined): string {
  if (!payload) return "";

  // Check if this part is text/plain
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  // Check if this part is text/html
  if (payload.mimeType === "text/html" && payload.body?.data) {
    // For now, return HTML as-is (could add HTML->text conversion later)
    return decodeBase64Url(payload.body.data);
  }

  // Recursively search in parts
  if (payload.parts) {
    for (const part of payload.parts) {
      // Prefer text/plain
      if (part.mimeType === "text/plain" && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    
    // Fall back to text/html
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    
    // Recursively search nested parts
    for (const part of payload.parts) {
      const text = extractTextBody(part);
      if (text) return text;
    }
  }

  return "";
}

/**
 * Decode base64url encoded string (Gmail uses this for message bodies)
 */
export function decodeBase64Url(data: string): string {
  // Convert base64url to base64
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  
  // Decode base64 to UTF-8
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Encode string to base64url (for sending emails)
 */
export function encodeBase64Url(data: string): string {
  const base64 = Buffer.from(data, "utf-8").toString("base64");
  
  // Convert base64 to base64url
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Build an RFC 2822 formatted email message
 */
export interface EmailMessage {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  inReplyTo?: string;
  references?: string;
}

export function buildRFC2822Message(message: EmailMessage): string {
  const lines: string[] = [];
  
  lines.push(`To: ${message.to.join(", ")}`);
  
  if (message.cc && message.cc.length > 0) {
    lines.push(`Cc: ${message.cc.join(", ")}`);
  }
  
  if (message.bcc && message.bcc.length > 0) {
    lines.push(`Bcc: ${message.bcc.join(", ")}`);
  }
  
  lines.push(`Subject: ${message.subject}`);
  
  if (message.inReplyTo) {
    lines.push(`In-Reply-To: ${message.inReplyTo}`);
  }
  
  if (message.references) {
    lines.push(`References: ${message.references}`);
  }
  
  lines.push("MIME-Version: 1.0");
  
  // If both text and HTML are provided, use multipart/alternative
  if (message.bodyText && message.bodyHtml) {
    const boundary = `boundary_${Date.now()}_${Math.random().toString(36)}`;
    lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    lines.push("");
    lines.push(`--${boundary}`);
    lines.push("Content-Type: text/plain; charset=UTF-8");
    lines.push("");
    lines.push(message.bodyText);
    lines.push("");
    lines.push(`--${boundary}`);
    lines.push("Content-Type: text/html; charset=UTF-8");
    lines.push("");
    lines.push(message.bodyHtml);
    lines.push("");
    lines.push(`--${boundary}--`);
  } else if (message.bodyHtml) {
    lines.push("Content-Type: text/html; charset=UTF-8");
    lines.push("");
    lines.push(message.bodyHtml);
  } else {
    lines.push("Content-Type: text/plain; charset=UTF-8");
    lines.push("");
    lines.push(message.bodyText || "");
  }
  
  return lines.join("\r\n");
}

/**
 * Extract attachment metadata from a message
 */
export interface Attachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId?: string;
}

export function extractAttachments(payload: gmail_v1.Schema$MessagePart | undefined): Attachment[] {
  const attachments: Attachment[] = [];
  
  if (!payload) return attachments;
  
  // Check if this part is an attachment
  if (payload.filename && payload.body?.attachmentId) {
    attachments.push({
      filename: payload.filename,
      mimeType: payload.mimeType || "application/octet-stream",
      size: payload.body.size || 0,
      attachmentId: payload.body.attachmentId,
    });
  }
  
  // Recursively check parts
  if (payload.parts) {
    for (const part of payload.parts) {
      attachments.push(...extractAttachments(part));
    }
  }
  
  return attachments;
}
