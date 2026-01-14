# Google OAuth Verification Guide

This guide helps you prepare and submit your app for Google OAuth verification, which is required for public use with sensitive Gmail scopes.

## Why Verification is Needed

Gmail scopes used by this app are classified as **sensitive** or **restricted**:
- `gmail.readonly` - Sensitive
- `gmail.modify` - Sensitive  
- `gmail.send` - Restricted
- `gmail.labels` - Sensitive

**Without verification**, users see an "unverified app" warning screen during OAuth. **With verification**, the app can be used by any Google account without warnings.

## Verification Process Timeline

- **Preparation**: 1-3 days
- **Submission**: 30 minutes
- **Google Review**: 2-6 weeks (average: 3-4 weeks)
- **Security Assessment** (if required): Additional 4-8 weeks

## Prerequisites Checklist

Before submitting for verification:

### ✅ 1. App Must Be Fully Functional
- [ ] OAuth flow works correctly
- [ ] All Gmail features work (read, modify, send, labels)
- [ ] Error handling is robust
- [ ] UI is polished and professional

### ✅ 2. Public URLs Required
- [ ] App deployed to production URL (Vercel)
- [ ] Privacy Policy published at a public URL
- [ ] Terms of Service published at a public URL
- [ ] Homepage/landing page (if separate from app)

### ✅ 3. OAuth Configuration
- [ ] OAuth consent screen fully configured
- [ ] All scopes properly justified
- [ ] Authorized domains added
- [ ] Redirect URIs configured correctly

### ✅ 4. Documentation Ready
- [ ] Privacy Policy (see PRIVACY_POLICY.md)
- [ ] Terms of Service (see TERMS_OF_SERVICE.md)
- [ ] Demo video (2-5 minutes)
- [ ] Scope justification document

## Step-by-Step Verification Process

### Step 1: Finalize OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services → OAuth consent screen**

**Fill out all required fields:**

#### App Information
- **App name**: Gmail AI Assistant
- **User support email**: [your-email@example.com]
- **App logo**: Upload a 120x120px logo (optional but recommended)
- **App domain**:
  - Homepage: `https://your-app.vercel.app`
  - Privacy Policy: `https://your-app.vercel.app/privacy` (create a page or link to GitHub)
  - Terms of Service: `https://your-app.vercel.app/terms`

#### Developer Contact Information
- **Email addresses**: [developer-email@example.com]

#### Authorized Domains
- `vercel.app` (or your custom domain)

### Step 2: Prepare Scope Justifications

For each scope, prepare a clear justification:

#### `https://www.googleapis.com/auth/gmail.readonly`
**Justification**: "Our app allows users to search their Gmail inbox using AI-powered natural language queries. This scope is necessary to retrieve email content, headers, and metadata to fulfill search requests and display results to the user."

#### `https://www.googleapis.com/auth/gmail.modify`
**Justification**: "Users can organize their emails by applying labels, archiving messages, and marking emails as read/unread through our AI assistant. This scope enables these organizational features."

#### `https://www.googleapis.com/auth/gmail.send`
**Justification**: "Our AI assistant can compose and send emails on behalf of the user when explicitly requested. This scope is required to send messages via the Gmail API. Users always confirm before emails are sent."

#### `https://www.googleapis.com/auth/gmail.labels`
**Justification**: "Users can create custom labels and apply them to organize their inbox. This scope allows reading and creating Gmail labels."

### Step 3: Create Demo Video

**Video Requirements** (2-5 minutes):
1. **Introduction** (30 sec)
   - Show app name and purpose
   - Explain what it does

2. **OAuth Flow** (1 min)
   - Click "Sign in with Google"
   - Show consent screen
   - Show which scopes are requested
   - Grant permissions

3. **Feature Demonstration** (2-3 min)
   - **Search**: Search for emails by keyword/date
   - **Read**: Display email content
   - **Organize**: Apply a label to emails
   - **Modify**: Archive or mark as read
   - **Send**: Compose and send an email (show confirmation)

4. **Privacy/Security** (30 sec)
   - Show where Privacy Policy is accessible
   - Mention encrypted token storage
   - Show how to revoke access

**Tools**: Use screen recording software like:
- Loom (recommended, easy)
- OBS Studio (free, professional)
- QuickTime (Mac)
- Windows Game Bar (Windows)

**Upload**: YouTube (unlisted or public)

### Step 4: Prepare Required Documents

Create a **Verification Package** document (Google Docs or PDF) with:

#### 1. App Overview
```
App Name: Gmail AI Assistant
Purpose: AI-powered Gmail management and organization
Tech Stack: Next.js, OpenAI GPT, Gmail API
Deployment: Vercel
```

#### 2. Scope Justifications
(Copy from Step 2 above)

#### 3. Data Handling
```
- How we access Gmail data: Only when user makes a request
- Where data is processed: Our servers (Vercel) + OpenAI API for AI processing
- How data is stored: Encrypted OAuth tokens in Supabase PostgreSQL
- Data retention: Conversation history until account deletion
- Third parties: OpenAI (for AI), Google (for Gmail)
```

#### 4. Security Measures
```
- OAuth 2.0 authentication
- AES-256-GCM encryption for refresh tokens
- HTTPS only
- Secure server-side session management
- Audit logging of all actions
```

#### 5. Compliance
```
- Privacy Policy: [URL]
- Terms of Service: [URL]
- Google API Services User Data Policy: Compliant
- GDPR: User data rights respected (access, deletion)
```

### Step 5: Submit for Verification

1. Go to **OAuth consent screen** in Google Cloud Console
2. Click **"Publish App"** (changes from Testing to In Production)
3. You'll see a warning about unverified app
4. Click **"Prepare for Verification"**
5. Fill out the verification form:
   - Upload domain verification proof
   - Provide Privacy Policy URL
   - Provide Terms of Service URL
   - Explain your app and scope usage
   - Link to demo video
   - Upload screenshots

6. Submit!

### Step 6: Respond to Google Review

Google may request additional information:
- Be responsive (reply within 1-2 business days)
- Provide clear, detailed answers
- Update your app if changes are needed
- Resubmit if rejected

## Common Rejection Reasons

1. **Privacy Policy missing or incomplete**
   - Must cover all data collection
   - Must explain third-party sharing (OpenAI)
   - Must describe data retention

2. **Scope justification unclear**
   - Be specific about WHY each scope is needed
   - Show HOW it's used in your app

3. **Demo video doesn't show scope usage**
   - Must demonstrate EACH requested scope
   - Show actual OAuth consent screen

4. **App not fully functional**
   - Test thoroughly before submission
   - Fix all bugs and errors

5. **Unauthorized domain**
   - Ensure redirect URIs match authorized domains
   - Verify domain ownership

## Security Assessment

If your app uses **restricted scopes** (like `gmail.send`), Google may require a **security assessment** by a third-party auditor.

### When Required
- Apps with restricted scopes
- Apps with large user base
- Apps that handle sensitive data

### What to Expect
- Additional 4-8 weeks
- May cost $15,000-$75,000 (via CASA or similar)
- Requires comprehensive security documentation
- Code review and penetration testing

### Alternatives
- Use a **service account** (for G Workspace domains only)
- Limit to **testing mode** (100 users max)
- Reduce scopes (avoid `gmail.send` if possible)

## Testing Mode (Temporary Solution)

While waiting for verification, you can:
1. Keep app in "Testing" mode
2. Add up to 100 test users manually
3. Test users won't see "unverified app" warning
4. No expiration on testing mode

**To add test users**:
1. OAuth consent screen → Test users
2. Add email addresses (one per line)
3. Save

## Checklist Before Submission

- [ ] App is deployed and publicly accessible
- [ ] Privacy Policy is published and accessible
- [ ] Terms of Service is published and accessible
- [ ] Demo video is recorded and uploaded
- [ ] All OAuth scopes are justified
- [ ] App has been thoroughly tested
- [ ] Brand/logo is professional
- [ ] Contact information is correct
- [ ] Documentation is complete

## After Approval

Once approved:
1. **Update OAuth consent screen**: Status will show "Published"
2. **Test with a new account**: Verify no warnings appear
3. **Monitor usage**: Check Google Cloud Console for API usage
4. **Maintain compliance**: Keep Privacy Policy updated

## Resources

- [Google OAuth Verification Guide](https://support.google.com/cloud/answer/9110914)
- [Gmail API Scopes](https://developers.google.com/gmail/api/auth/scopes)
- [User Data Policy](https://developers.google.com/terms/api-services-user-data-policy)
- [OAuth Brand Guidelines](https://developers.google.com/identity/branding-guidelines)

## Support

If you encounter issues during verification:
- Check [Google OAuth Support](https://support.google.com/code/contact/oauth_app_verification)
- Review [Cloud Console Help](https://support.google.com/cloud)
- Post in [Stack Overflow](https://stackoverflow.com/questions/tagged/google-oauth) with tag `google-oauth`

---

**Good luck with your verification! 🚀**
