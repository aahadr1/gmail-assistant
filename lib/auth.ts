import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import { encrypt } from "@/lib/crypto/encryption";

// Gmail API scopes needed for full functionality
const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.labels",
];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      /**
       * We only support Google sign-in. During initial setup it's possible to
       * have a User row created without the Account row (due to earlier DB/schema
       * issues). This option allows NextAuth to safely link the Google account
       * to the existing user by email.
       */
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          // Request offline access to get refresh token
          access_type: "offline",
          // Force consent screen to always get refresh_token
          prompt: "consent",
          // Request Gmail scopes
          scope: [
            "openid",
            "email",
            "profile",
            ...GMAIL_SCOPES,
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (!account || !profile) return false;

      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    /**
     * Runs after an OAuth account is linked/created. This is the correct time
     * to capture and encrypt refresh_token, because the Account row exists.
     */
    async linkAccount({ account }) {
      if (!account?.refresh_token) return;

      const encrypted = encrypt(account.refresh_token);

      await prisma.account.updateMany({
        where: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
        data: {
          encrypted_refresh_token: encrypted.encrypted,
          refresh_token_iv: encrypted.iv,
          refresh_token_tag: encrypted.tag,
          refresh_token: null,
        },
      });
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
