import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last Updated: January 14, 2026</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Gmail AI Assistant, you accept and agree to be bound by these Terms of Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>Gmail AI Assistant provides AI-powered assistance for managing your Gmail inbox, including:</p>
            <ul>
              <li>Searching and organizing emails</li>
              <li>Applying labels and filters</li>
              <li>Archiving and deleting messages</li>
              <li>Sending emails on your behalf</li>
            </ul>

            <h2>3. Gmail Access and Permissions</h2>
            <h3>Required Permissions</h3>
            <p>The App requests the following Gmail permissions:</p>
            <ul>
              <li><strong>Read</strong>: To search and display your emails</li>
              <li><strong>Modify</strong>: To organize emails with labels</li>
              <li><strong>Send</strong>: To send emails when requested</li>
              <li><strong>Labels</strong>: To create and manage Gmail labels</li>
            </ul>

            <h3>Your Control</h3>
            <ul>
              <li>You grant permissions via Google OAuth</li>
              <li>You can revoke access at any time</li>
              <li>Revoking access will prevent the App from functioning</li>
            </ul>

            <h2>4. AI-Powered Features</h2>
            <p>
              The Service uses OpenAI's GPT models. Email content necessary to fulfill your requests 
              may be sent to OpenAI. AI responses are generated automatically and may contain errors.
            </p>

            <h2>5. Prohibited Uses</h2>
            <p>You may not:</p>
            <ul>
              <li>Use the Service to send spam or unsolicited emails</li>
              <li>Violate any laws or regulations</li>
              <li>Attempt to gain unauthorized access to systems</li>
              <li>Use the Service to harass or harm others</li>
            </ul>

            <h2>6. Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee 
              that the Service will be error-free or uninterrupted.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
            </p>

            <h2>8. Account Termination</h2>
            <p>
              You may delete your account at any time. We may suspend or terminate accounts 
              that violate these Terms.
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Continued use after 
              changes constitutes acceptance.
            </p>

            <h2>10. Contact Information</h2>
            <p>For questions about these Terms, please contact us via our GitHub repository.</p>

            <h2>Acknowledgment</h2>
            <p>
              BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE 
              TO BE BOUND BY THESE TERMS OF SERVICE.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
