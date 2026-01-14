# Quick Start Guide

Get your Gmail AI Assistant running in 15 minutes.

## Prerequisites

- Node.js 18+ installed
- A Google account
- An OpenAI API key

## Step 1: Clone & Install (2 min)

```bash
cd gmail-assistant
npm install
```

## Step 2: Generate Security Keys (1 min)

```bash
node scripts/generate-keys.js
```

Copy the generated keys for the next step.

## Step 3: Setup Google OAuth (5 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "Gmail AI Assistant"
3. Enable **Gmail API**:
   - APIs & Services → Library → Search "Gmail API" → Enable
4. Configure OAuth consent screen:
   - APIs & Services → OAuth consent screen
   - Choose "External"
   - Fill in:
     - App name: "Gmail AI Assistant"
     - User support email: your-email@gmail.com
     - Developer contact: your-email@gmail.com
   - Add scopes:
     - `.../auth/gmail.readonly`
     - `.../auth/gmail.modify`
     - `.../auth/gmail.send`
     - `.../auth/gmail.labels`
   - Add test users: your-email@gmail.com
5. Create credentials:
   - APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Client Secret

## Step 4: Setup Supabase Database (3 min)

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project: "gmail-assistant"
3. Copy database connection string:
   - Settings → Database → Connection string (URI)
   - Replace `[YOUR-PASSWORD]` with your actual password

## Step 5: Configure Environment Variables (2 min)

Create `.env.local` file:

```bash
# From Google Cloud Console
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# From step 2 (generate-keys.js)
NEXTAUTH_SECRET=paste_generated_secret_here
TOKEN_ENCRYPTION_KEY=paste_generated_key_here

# Fixed for local dev
NEXTAUTH_URL=http://localhost:3000

# Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-your_key_here
OPENAI_MODEL=gpt-4o

# From Supabase
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

## Step 6: Initialize Database (1 min)

```bash
npx prisma db push
```

## Step 7: Run the App! (1 min)

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## First Use

1. Click "Continue with Google"
2. Sign in with your Google account
3. Grant the requested permissions
4. Start chatting!

**Try these prompts:**
- "Find all emails from 2022 about invoices"
- "Search for messages from john@example.com"
- "Create a label called 'Important' and show me all starred emails"

## Troubleshooting

### "No refresh token found"
- Sign out (Settings → Delete Account)
- Sign in again and grant all permissions

### Database connection error
- Check your `DATABASE_URL` is correct
- Verify Supabase project is active

### OAuth error / unverified app warning
- Make sure you added yourself as a test user
- App status should be "Testing" (not "In Production")

### Build errors
- Run `npm install` again
- Delete `.next` folder and rebuild: `rm -rf .next && npm run build`

## Next Steps

- **Deploy to Vercel**: See [README.md](README.md#deployment-to-vercel)
- **Add more test users**: Google Cloud Console → OAuth consent screen → Test users
- **Apply for verification**: See [GOOGLE_VERIFICATION_GUIDE.md](GOOGLE_VERIFICATION_GUIDE.md)

## Support

Questions? Open an issue on GitHub.

Enjoy your Gmail AI Assistant! 🚀
