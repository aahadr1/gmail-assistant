# Deployment Guide - Vercel

Deploy Gmail AI Assistant to production on Vercel.

## Pre-Deployment Checklist

- [ ] App works locally (`npm run dev`)
- [ ] Database is set up on Supabase
- [ ] Google OAuth configured with production redirect URI
- [ ] OpenAI API key ready
- [ ] Environment variables documented
- [ ] Privacy Policy and Terms accessible

## Step 1: Prepare Your Repository

```bash
# Initialize git if not done
git init

# Add all files
git add .
git commit -m "Initial commit - Gmail AI Assistant"

# Create GitHub repo and push
git remote add origin https://github.com/your-username/gmail-ai-assistant.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (or `gmail-assistant` if in subdirectory)
   - **Build Command**: `prisma generate && next build` (default)
   - **Output Directory**: `.next` (default)

## Step 3: Set Environment Variables

In Vercel project settings → Environment Variables, add:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret  # Same as local
NEXTAUTH_URL=https://your-app-name.vercel.app  # ⚠️ UPDATE THIS!

# OpenAI
OPENAI_API_KEY=sk-proj-your_openai_key
OPENAI_MODEL=gpt-4o

# Database (Supabase)
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# Token Encryption
TOKEN_ENCRYPTION_KEY=your_32_byte_base64_key  # Same as local
```

**Important:**
- Set these for "Production", "Preview", and "Development" environments
- `NEXTAUTH_URL` MUST match your actual Vercel deployment URL

## Step 4: Update Google OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to: APIs & Services → Credentials
4. Click your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", add:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
6. Save

**Pro tip:** Get your Vercel URL from the deployment, then update OAuth settings.

## Step 5: Deploy!

Click "Deploy" in Vercel.

Vercel will:
1. Install dependencies (`npm install`)
2. Generate Prisma client (`prisma generate`)
3. Build Next.js app (`next build`)
4. Deploy to global CDN

⏱️ **First deployment**: ~2-3 minutes

## Step 6: Initialize Production Database

After first deployment:

```bash
# Set DATABASE_URL to production (Supabase)
export DATABASE_URL="postgresql://..."

# Push schema to production database
npx prisma db push
```

Or use Prisma Studio:
```bash
npx prisma studio
```

## Step 7: Test Production App

1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. Click "Continue with Google"
3. Authenticate and grant permissions
4. Test a search: "Find emails from last week"

## Post-Deployment

### Custom Domain (Optional)

1. Vercel project → Settings → Domains
2. Add your custom domain (e.g., `gmail-ai.example.com`)
3. Update `NEXTAUTH_URL` environment variable
4. Update Google OAuth redirect URI

### Monitoring

- **Vercel Dashboard**: View deployment logs, analytics
- **Supabase Dashboard**: Monitor database queries
- **OpenAI Usage**: Check API usage at platform.openai.com

### Continuous Deployment

Every push to `main` branch triggers a new deployment automatically.

For staging:
- Create a `develop` branch
- Vercel auto-creates preview deployments for PRs

## Troubleshooting

### Build Fails

**Error**: `Prisma Client not generated`
**Fix**: Ensure build command includes `prisma generate`

**Error**: `Module not found`
**Fix**: Check `package.json` dependencies, run `npm install` locally

### Runtime Errors

**Error**: `NEXTAUTH_URL env var not set`
**Fix**: Add `NEXTAUTH_URL` in Vercel environment variables

**Error**: `OAuth redirect_uri mismatch`
**Fix**: Verify Google OAuth redirect URI matches your Vercel URL exactly

**Error**: `Cannot connect to database`
**Fix**: Check `DATABASE_URL` is correct, Supabase project is active

### Performance Issues

- **Slow API responses**: Check OpenAI API latency
- **Database queries slow**: Add indexes (check Prisma schema)
- **Cold starts**: Vercel serverless functions have ~100ms cold start

### Security

- **Rotate secrets regularly**: Update `NEXTAUTH_SECRET`, `TOKEN_ENCRYPTION_KEY`
- **Monitor logs**: Check for unauthorized access attempts
- **Rate limiting**: Consider adding rate limits for production

## Scaling Considerations

As your app grows:

1. **Database Connection Pooling**:
   - Use Supabase connection pooler
   - Or add Prisma Accelerate for caching

2. **Caching**:
   - Cache Gmail API responses (Redis/Upstash)
   - Cache conversation history

3. **Background Jobs**:
   - Use Vercel Cron for scheduled tasks
   - Or Inngest for job queues

4. **Analytics**:
   - Add Vercel Analytics
   - Or custom analytics (PostHog, Mixpanel)

## Cost Estimation

**Free Tier (Hobby)**:
- Vercel: Free (100GB bandwidth, 6000 build minutes/mo)
- Supabase: Free (500MB database, 2GB bandwidth)
- OpenAI: Pay-per-use (~$0.01-0.10 per conversation)

**Pro Tier (Production)**:
- Vercel Pro: $20/month
- Supabase Pro: $25/month (8GB database)
- OpenAI: Variable based on usage

**Estimated total**: $50-100/month for moderate usage (100-500 users)

## Next Steps

- ✅ App deployed and running
- [ ] Set up monitoring and alerts
- [ ] Add analytics
- [ ] Submit for Google OAuth verification (see [GOOGLE_VERIFICATION_GUIDE.md](GOOGLE_VERIFICATION_GUIDE.md))
- [ ] Add custom domain
- [ ] Implement rate limiting
- [ ] Set up error tracking (Sentry)

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

**Congratulations! 🎉 Your Gmail AI Assistant is now live!**
