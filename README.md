# Gmail AI Assistant

A production-ready web application that uses AI to interact with Gmail. Built with Next.js, deployed on Vercel, using Supabase for database.

## Features

- 🔍 **Smart Email Search**: Search emails by keywords, date ranges, senders, and more
- 🤖 **AI-Powered Organization**: Automatically organize and categorize emails
- 🏷️ **Label Management**: Create, apply, and manage Gmail labels
- 📧 **Email Actions**: Archive, trash, mark as read/unread
- ✉️ **Send Emails**: Compose and send emails through the AI agent
- 🔐 **Secure**: OAuth 2.0 authentication, encrypted token storage (AES-256-GCM)
- 📊 **Audit Logs**: Track all actions performed on your Gmail

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with Google OAuth
- **AI**: OpenAI GPT-4 with function calling
- **Gmail**: Google Gmail API
- **Deployment**: Vercel

## Prerequisites

1. **Google Cloud Project** with Gmail API enabled
2. **OAuth 2.0 credentials** (Client ID & Secret)
3. **Supabase project** (PostgreSQL database)
4. **OpenAI API key**

## Setup Instructions

### 1. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the **Gmail API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Gmail API" and enable it
4. Configure OAuth consent screen:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" (for public use) or "Internal" (for workspace only)
   - Fill in app name, support email, developer contact
   - Add scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/gmail.labels`
   - Add test users (if in testing mode)
5. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://your-domain.vercel.app/api/auth/callback/google` (production)
   - Save the Client ID and Client Secret

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Get your database connection string:
   - Go to Project Settings → Database
   - Copy the "Connection string" (URI format)
   - Replace `[YOUR-PASSWORD]` with your database password

### 3. Environment Variables

Create a `.env.local` file in the project root:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth
NEXTAUTH_SECRET=your_random_secret_here  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=sk-proj-your_openai_key_here
OPENAI_MODEL=gpt-4o

# Supabase Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres

# Token Encryption (32-byte key)
TOKEN_ENCRYPTION_KEY=your_32_byte_key_here  # Generate with: openssl rand -base64 32
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables (same as `.env.local` but update `NEXTAUTH_URL` to your production URL)
4. Deploy!

### 3. Update OAuth Redirect URIs

After deployment, add your Vercel URL to Google Cloud OAuth settings:
- `https://your-app.vercel.app/api/auth/callback/google`

## OAuth Verification (For Public Launch)

If you plan to publish the app publicly, Google requires OAuth verification for sensitive scopes:

1. **Prepare documentation**:
   - Privacy Policy (required)
   - Terms of Service (required)
   - App description and justification for each scope
   - Demo video showing the app in action

2. **Submit for verification**:
   - Go to Google Cloud Console → OAuth consent screen
   - Click "Publish App"
   - Follow the verification process

3. **Security Assessment**:
   - For `gmail.send` and `gmail.modify` scopes, Google may require a security assessment
   - This can take several weeks

**Testing Mode**: While in testing, you can add up to 100 test users who can use the app without verification.

## Architecture

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│   Next.js Web App (Vercel)  │
├─────────────────────────────┤
│  • Chat Interface            │
│  • Auth (NextAuth.js)        │
│  • API Routes                │
└──────┬──────────────┬───────┘
       │              │
       ▼              ▼
┌─────────────┐  ┌──────────────┐
│  Supabase   │  │  OpenAI GPT  │
│  Postgres   │  │  (AI Agent)  │
└─────────────┘  └──────┬───────┘
                        │
                        ▼
                 ┌─────────────┐
                 │  Gmail API  │
                 └─────────────┘
```

## Security Features

- **OAuth 2.0**: Secure Google authentication
- **Encrypted Tokens**: Refresh tokens stored with AES-256-GCM encryption
- **Audit Logs**: All Gmail actions are logged
- **Session Management**: Secure server-side sessions
- **No Client-Side Secrets**: API keys and tokens never exposed to browser

## Usage Examples

### Search Emails

> "Find all emails from 2022 about invoices"

> "Search for messages from john@example.com in the last month"

### Organize

> "Create a label called 'Important Contracts' and move all PDFs from legal@company.com there"

> "Archive all emails older than 6 months from the inbox"

### Send Emails

> "Send an email to team@company.com with subject 'Meeting Tomorrow' and body 'Don't forget our 2pm meeting'"

## Troubleshooting

### "No refresh token found"

- Sign out and sign in again
- Make sure you grant all requested permissions during OAuth

### "Failed to refresh Gmail token"

- Your refresh token may have been revoked
- Go to Settings → "Reconnect Google Account"

### Database connection errors

- Verify your `DATABASE_URL` is correct
- Check Supabase project is active
- Ensure database password is correct

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
# gmail-assistant
