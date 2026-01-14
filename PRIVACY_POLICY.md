# Privacy Policy

**Last Updated: January 14, 2026**

## Introduction

Gmail AI Assistant ("we", "our", or "the App") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.

## Information We Collect

### 1. Google Account Information
When you sign in with Google, we collect:
- Your name
- Your email address
- Your profile picture
- OAuth access and refresh tokens

### 2. Gmail Data
With your explicit permission, we access:
- Email messages (headers, content, attachments metadata)
- Email labels
- Email metadata (dates, senders, recipients)

### 3. Usage Data
We store:
- Your conversations with the AI assistant
- Audit logs of actions performed (searches, label changes, emails sent)
- Session information

## How We Use Your Information

We use your information solely to:
1. **Authenticate you** using Google OAuth 2.0
2. **Search and retrieve emails** at your request
3. **Organize emails** (apply labels, archive, trash) as instructed
4. **Send emails** on your behalf when you explicitly request
5. **Provide AI-powered assistance** for managing your inbox
6. **Maintain audit logs** for transparency and debugging

## How We Store Your Information

### Security Measures
- **Encrypted Tokens**: OAuth refresh tokens are encrypted using AES-256-GCM before storage
- **Secure Database**: All data stored in Supabase PostgreSQL with encryption at rest
- **HTTPS Only**: All communications encrypted in transit
- **No Third-Party Sharing**: We do not share your Gmail data with any third parties except as described below

### Data Retention
- **Session Data**: Retained while you're actively using the app
- **Conversation History**: Retained until you delete your account
- **Audit Logs**: Retained for 90 days
- **OAuth Tokens**: Retained until you disconnect your account

## Third-Party Services

We use the following third-party services:

### OpenAI (GPT API)
- **What we send**: Your prompts and email metadata/content necessary to fulfill your requests
- **Purpose**: To provide AI-powered email assistance
- **Their policy**: [OpenAI Privacy Policy](https://openai.com/privacy/)

### Google Gmail API
- **What we access**: Your Gmail data as authorized by you
- **Purpose**: To search, read, modify, and send emails per your instructions
- **Their policy**: [Google Privacy Policy](https://policies.google.com/privacy)

### Supabase
- **What we store**: User accounts, encrypted tokens, conversations, audit logs
- **Purpose**: Database hosting
- **Their policy**: [Supabase Privacy Policy](https://supabase.com/privacy)

### Vercel
- **What we host**: The application itself
- **Purpose**: Hosting and deployment
- **Their policy**: [Vercel Privacy Policy](https://vercel.com/legal/privacy-policy)

## Your Data Rights

You have the right to:
1. **Access** your data at any time
2. **Delete** your account and all associated data
3. **Revoke** Gmail access at any time via Google Account settings
4. **Export** your conversation history (contact us)

### How to Delete Your Data
1. Sign in to the app
2. Go to Settings
3. Click "Delete Account & Data"

This will:
- Delete all your conversations
- Delete all audit logs
- Revoke our access to your Gmail
- Remove your account

## Limited Use Disclosure

Gmail AI Assistant's use of information received from Google APIs adheres to [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

Specifically:
- We only request the minimum Gmail scopes necessary for functionality
- We do not use Gmail data for advertising purposes
- We do not allow humans to read your email (except to debug with your explicit consent)
- We do not transfer Gmail data to third parties except as necessary to provide the service (e.g., OpenAI for AI processing)

## Children's Privacy

Our service is not directed to children under 13 years of age. We do not knowingly collect information from children under 13.

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Last Updated" date and, if required, seeking your consent.

## Contact Us

If you have questions about this Privacy Policy or your data:
- Email: [your-email@example.com]
- GitHub Issues: [repository-url]

## Consent

By using Gmail AI Assistant, you consent to this Privacy Policy and our processing of your data as described.
