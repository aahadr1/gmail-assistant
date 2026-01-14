import { google, gmail_v1 } from "googleapis";
import { getGmailToken } from "@/lib/auth/get-gmail-token";

/**
 * Get an authenticated Gmail client for the current user
 */
export async function getGmailClient(): Promise<gmail_v1.Gmail> {
  const tokens = await getGmailToken();
  
  if (!tokens) {
    throw new Error("Not authenticated with Gmail");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}
