import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last Updated: January 14, 2026</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <h2>Introduction</h2>
            <p>
              Gmail AI Assistant ("we", "our", or "the App") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.
            </p>

            <h2>Information We Collect</h2>
            <h3>1. Google Account Information</h3>
            <p>When you sign in with Google, we collect:</p>
            <ul>
              <li>Your name</li>
              <li>Your email address</li>
              <li>Your profile picture</li>
              <li>OAuth access and refresh tokens</li>
            </ul>

            <h3>2. Gmail Data</h3>
            <p>With your explicit permission, we access:</p>
            <ul>
              <li>Email messages (headers, content, attachments metadata)</li>
              <li>Email labels</li>
              <li>Email metadata (dates, senders, recipients)</li>
            </ul>

            <h3>3. Usage Data</h3>
            <p>We store:</p>
            <ul>
              <li>Your conversations with the AI assistant</li>
              <li>Audit logs of actions performed</li>
              <li>Session information</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use your information solely to:</p>
            <ol>
              <li>Authenticate you using Google OAuth 2.0</li>
              <li>Search and retrieve emails at your request</li>
              <li>Organize emails as instructed</li>
              <li>Send emails on your behalf when explicitly requested</li>
              <li>Provide AI-powered assistance for managing your inbox</li>
              <li>Maintain audit logs for transparency</li>
            </ol>

            <h2>Security Measures</h2>
            <ul>
              <li><strong>Encrypted Tokens</strong>: OAuth refresh tokens are encrypted using AES-256-GCM</li>
              <li><strong>Secure Database</strong>: Data stored in Supabase PostgreSQL with encryption at rest</li>
              <li><strong>HTTPS Only</strong>: All communications encrypted in transit</li>
              <li><strong>No Third-Party Sharing</strong>: We do not share your Gmail data with any third parties except as required for service operation</li>
            </ul>

            <h2>Third-Party Services</h2>
            <p>We use the following services:</p>
            <ul>
              <li><strong>OpenAI</strong>: For AI-powered email assistance</li>
              <li><strong>Google Gmail API</strong>: To access your Gmail data</li>
              <li><strong>Supabase</strong>: Database hosting</li>
              <li><strong>Vercel</strong>: Application hosting</li>
            </ul>

            <h2>Your Data Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your data at any time</li>
              <li>Delete your account and all associated data</li>
              <li>Revoke Gmail access via Google Account settings</li>
              <li>Export your conversation history</li>
            </ul>

            <h2>Limited Use Disclosure</h2>
            <p>
              Gmail AI Assistant's use of information received from Google APIs adheres to the{" "}
              <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
                Google API Services User Data Policy
              </a>, including the Limited Use requirements.
            </p>

            <h2>Contact Us</h2>
            <p>For questions about this Privacy Policy, please contact us via our GitHub repository.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
