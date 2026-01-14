import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { decrypt, encrypt } from "@/lib/crypto/encryption";
import { google } from "googleapis";

export interface GmailTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Get Gmail access token for the current user
 * Refreshes the token if needed
 */
export async function getGmailToken(): Promise<GmailTokens | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  // Find the Google account for this user
  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "google",
    },
  });

  if (!account) {
    return null;
  }

  // Prefer encrypted refresh token; fall back to plain refresh_token (legacy/first-time) and encrypt it.
  let refreshToken: string | null = null;

  if (account.encrypted_refresh_token && account.refresh_token_iv && account.refresh_token_tag) {
    refreshToken = decrypt({
      encrypted: account.encrypted_refresh_token,
      iv: account.refresh_token_iv,
      tag: account.refresh_token_tag,
    });
  } else if (account.refresh_token) {
    refreshToken = account.refresh_token;

    // Encrypt it now and wipe plaintext storage
    const encrypted = encrypt(refreshToken);
    await prisma.account.update({
      where: { id: account.id },
      data: {
        encrypted_refresh_token: encrypted.encrypted,
        refresh_token_iv: encrypted.iv,
        refresh_token_tag: encrypted.tag,
        refresh_token: null,
      },
    });
  }

  if (!refreshToken) {
    throw new Error("No refresh token found. Please reconnect your Google account.");
  }

  // Check if access token is still valid
  const now = Math.floor(Date.now() / 1000);
  if (account.access_token && account.expires_at && account.expires_at > now + 60) {
    // Token is still valid (with 60s buffer)
    return {
      accessToken: account.access_token,
      refreshToken,
    };
  }

  // Access token expired or missing, refresh it
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (!credentials.access_token) {
      throw new Error("Failed to refresh access token");
    }

    // Update the access token in the database
    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        access_token: credentials.access_token,
        expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null,
      },
    });

    return {
      accessToken: credentials.access_token,
      refreshToken,
    };
  } catch (error) {
    console.error("Failed to refresh Gmail token:", error);
    throw new Error("Failed to refresh Gmail access token. Please reconnect your Google account.");
  }
}
