import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import type { EmailTemplate } from './EmailTemplateEditor';
import type { Recipient } from './EmailRecipients';

interface SendEmailsProps {
  template: EmailTemplate;
  recipients: Recipient[];
  onSend: () => void;
}

export function SendEmails({ template, recipients, onSend }: SendEmailsProps) {
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sent, setSent] = useState(false);

  const replaceVariables = (text: string, recipient: Recipient): string => {
    return text
      .replace(/\{\{firstName\}\}/g, recipient.firstName || '')
      .replace(/\{\{lastName\}\}/g, recipient.lastName || '')
      .replace(/\{\{email\}\}/g, recipient.email)
      .replace(/\{\{schoolName\}\}/g, recipient.schoolName || '');
  };

  const handleSend = async () => {
    setIsSending(true);
    setProgress(0);
    setSent(false);

    // Simulate sending emails
    for (let i = 0; i <= recipients.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setProgress((i / recipients.length) * 100);
    }

    setIsSending(false);
    setSent(true);
    onSend();
    // report to backend
    try {
      await fetch('/api/email-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Date.now().toString(),
          subject: template.subject,
          recipientCount: recipients.length,
          sentAt: new Date().toISOString(),
          status: 'sent',
        }),
      });
    } catch {
      // ignore
    }
  };

  const previewEmail = recipients.length > 0 ? recipients[0] : null;
  const previewSubject = previewEmail ? replaceVariables(template.subject, previewEmail) : template.subject;
  const previewBody = previewEmail ? replaceVariables(template.body, previewEmail) : template.body;

  const isReady = template.subject && template.body && recipients.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send Summary</CardTitle>
          <CardDescription>Review your campaign before sending</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-secondary-content">Recipients</div>
              <div className="text-primary-content">{recipients.length} recipients</div>
            </div>
            <div className="space-y-1 col-span-2">
              <div className="text-sm text-secondary-content">Subject</div>
              <div className="text-primary-content">{template.subject || '(No subject)'}</div>
            </div>
          </div>

          {!isReady && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {!template.subject || !template.body
                  ? 'Please complete your email template before sending.'
                  : 'Please add at least one recipient before sending.'}
              </AlertDescription>
            </Alert>
          )}

          {sent && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully sent {recipients.length} emails! (Note: This is a demo - no actual emails were sent)
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {previewEmail && (
        <Card>
          <CardHeader>
            <CardTitle>Preview (Personalized)</CardTitle>
            <CardDescription>
              Preview of how the email will look for {previewEmail.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-secondary-content">Subject:</div>
              <div className="text-primary-content">{previewSubject}</div>
            </div>
            <div>
              <div className="text-sm text-secondary-content mb-2">Body:</div>
              <div className="preview-box whitespace-pre-wrap text-primary-content">
                {previewBody}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Send Campaign</CardTitle>
          <CardDescription>
            Ready to send? Click the button below to start sending emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSending && (
            <div className="space-y-2">
              <div className="text-sm text-secondary-content">Sending emails...</div>
              <Progress value={progress} />
              <div className="text-sm text-secondary-content">
                {Math.round((progress / 100) * recipients.length)} of {recipients.length} sent
              </div>
            </div>
          )}

          <Button onClick={handleSend} disabled={!isReady || isSending} size="lg">
            <Send className="mr-2 h-4 w-4" />
            {isSending ? 'Sending...' : `Send to ${recipients.length} Recipients`}
          </Button>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is a demo application. To send real emails, you would need to connect to an email service provider.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
