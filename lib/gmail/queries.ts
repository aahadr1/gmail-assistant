/**
 * Build Gmail search queries
 * https://support.google.com/mail/answer/7190?hl=en
 */

export interface SearchFilters {
  query?: string;
  from?: string;
  to?: string;
  subject?: string;
  after?: Date | string; // YYYY/MM/DD
  before?: Date | string; // YYYY/MM/DD
  hasAttachment?: boolean;
  label?: string;
  isUnread?: boolean;
  isStarred?: boolean;
}

/**
 * Convert Date to Gmail format (YYYY/MM/DD)
 */
function formatGmailDate(date: Date | string): string {
  if (typeof date === "string") return date;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  
  return `${year}/${month}/${day}`;
}

/**
 * Build a Gmail search query string from filters
 */
export function buildGmailQuery(filters: SearchFilters): string {
  const parts: string[] = [];

  if (filters.query) {
    parts.push(filters.query);
  }

  if (filters.from) {
    parts.push(`from:${filters.from}`);
  }

  if (filters.to) {
    parts.push(`to:${filters.to}`);
  }

  if (filters.subject) {
    parts.push(`subject:${filters.subject}`);
  }

  if (filters.after) {
    parts.push(`after:${formatGmailDate(filters.after)}`);
  }

  if (filters.before) {
    parts.push(`before:${formatGmailDate(filters.before)}`);
  }

  if (filters.hasAttachment) {
    parts.push("has:attachment");
  }

  if (filters.label) {
    parts.push(`label:${filters.label}`);
  }

  if (filters.isUnread) {
    parts.push("is:unread");
  }

  if (filters.isStarred) {
    parts.push("is:starred");
  }

  return parts.join(" ");
}

/**
 * Parse a natural language date to a Date object
 * Examples: "2022", "January 2023", "2023-01-15"
 */
export function parseNaturalDate(dateStr: string): Date | null {
  // Year only: "2022"
  if (/^\d{4}$/.test(dateStr)) {
    return new Date(`${dateStr}-01-01`);
  }

  // Try standard date parsing
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  return null;
}
