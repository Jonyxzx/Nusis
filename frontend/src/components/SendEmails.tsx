import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Send, CheckCircle, AlertCircle, Eye, Users, Mail } from "lucide-react";
import DOMPurify from "dompurify";
import { normalizeHtml } from "@/lib/emailTemplateUtils";
import type { EmailTemplate } from "./EmailTemplateEditor";
import type { Recipient } from "./EmailRecipients";

interface SendEmailsProps {
  template: EmailTemplate;
  recipients: Recipient[];
  onSend: () => void;
}

export function SendEmails({ template, recipients, onSend }: SendEmailsProps) {
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sent, setSent] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const replaceVariables = (text: string, recipient: Recipient): string => {
    return text
      .replace(/\{\{firstName\}\}/g, recipient.name || "")
      .replace(/\{\{email\}\}/g, recipient.email);
  };

  const handleSend = async () => {
    setShowConfirmDialog(true);
  };

  const confirmSend = async () => {
    setShowConfirmDialog(false);
    setIsSending(true);
    setProgress(0);
    setSent(false);

    try {
      // Send POST request to fake endpoint
      // TODO: Replace with real email sending endpoint
      const response = await fetch("/api/send-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: {
            subject: template.subject,
            body: template.body,
          },
          recipients: recipients.map((r) => ({ name: r.name, email: r.email })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send emails");
      }

      // Simulate progress for demo purposes
      for (let i = 0; i <= recipients.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setProgress((i / recipients.length) * 100);
      }

      setSent(true);
      onSend();

      // Report to email history
      try {
        await fetch("/api/email-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: Date.now().toString(),
            subject: template.subject,
            recipientCount: recipients.length,
            sentAt: new Date().toISOString(),
            status: "sent",
          }),
        });
      } catch {
        // ignore history reporting errors
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      // In a real app, you'd show an error message here
    } finally {
      setIsSending(false);
    }
  };

  const previewEmail = recipients.length > 0 ? recipients[0] : null;
  const previewSubject = previewEmail
    ? replaceVariables(template.subject, previewEmail)
    : template.subject;
  const previewBody = previewEmail
    ? replaceVariables(template.body, previewEmail)
    : template.body;

  const isReady = template.subject && template.body && recipients.length > 0;

  return (
    <div className='space-y-6'>
      {/* Campaign Overview */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Mail className='h-5 w-5' />
            Email Campaign Overview
          </CardTitle>
          <CardDescription>
            Review your campaign details and send personalized emails to{" "}
            {recipients.length} recipients
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Campaign Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='flex items-center gap-3 p-4 border rounded-lg bg-muted/50'>
              <Users className='h-8 w-8 text-primary' />
              <div>
                <div className='text-2xl font-bold'>{recipients.length}</div>
                <div className='text-sm text-secondary-content'>Recipients</div>
              </div>
            </div>
            <div className='flex items-center gap-3 p-4 border rounded-lg bg-muted/50'>
              <Mail className='h-8 w-8 text-primary' />
              <div>
                <div className='text-2xl font-bold'>1</div>
                <div className='text-sm text-secondary-content'>Template</div>
              </div>
            </div>
            <div className='flex items-center gap-3 p-4 border rounded-lg bg-muted/50'>
              <Eye className='h-8 w-8 text-primary' />
              <div>
                <div className='text-2xl font-bold'>
                  {isReady ? "Ready" : "Incomplete"}
                </div>
                <div className='text-sm text-secondary-content'>Status</div>
              </div>
            </div>
          </div>

          {/* Email Content Preview */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Email Content</h3>
            <div className='border rounded-lg p-4 bg-white'>
              <div className='space-y-3'>
                <div>
                  <div className='text-sm text-secondary-content mb-1'>
                    Subject:
                  </div>
                  <div className='font-medium text-black'>
                    {template.subject || "(No subject)"}
                  </div>
                </div>
                <div>
                  <div className='text-sm text-secondary-content mb-1'>
                    Body:
                  </div>
                  <div className='text-sm leading-relaxed text-black'>
                    {template.body ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            normalizeHtml(String(template.body))
                          ),
                        }}
                      />
                    ) : (
                      <span className='text-secondary-content'>
                        (No content)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recipients Preview */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>
              Recipients ({recipients.length})
            </h3>
            <div className='border rounded-lg p-4 bg-muted/50 max-h-40 overflow-y-auto'>
              {recipients.length === 0 ? (
                <div className='text-secondary-content'>
                  No recipients selected
                </div>
              ) : (
                <div className='space-y-2'>
                  {recipients.slice(0, 10).map((recipient, index) => (
                    <div
                      key={index}
                      className='flex justify-between items-center text-sm'
                    >
                      <span className='font-medium'>{recipient.name}</span>
                      <span className='text-secondary-content'>
                        {recipient.email}
                      </span>
                    </div>
                  ))}
                  {recipients.length > 10 && (
                    <div className='text-secondary-content text-sm'>
                      ...and {recipients.length - 10} more recipients
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {!isReady && (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                {!template.subject || !template.body
                  ? "Please complete your email template before sending."
                  : "Please add at least one recipient before sending."}
              </AlertDescription>
            </Alert>
          )}

          {sent && (
            <Alert>
              <CheckCircle className='h-4 w-4' />
              <AlertDescription>
                Successfully sent {recipients.length} emails! (Note: This is a
                demo - no actual emails were sent)
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Personalized Preview */}
      {previewEmail && (
        <Card>
          <CardHeader>
            <CardTitle>Personalized Preview</CardTitle>
            <CardDescription>
              How the email will appear for {previewEmail.name} (
              {previewEmail.email})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='border rounded-lg p-4 bg-white'>
              <div className='space-y-3'>
                <div>
                  <div className='text-sm text-secondary-content mb-1'>
                    Subject:
                  </div>
                  <div className='font-medium text-black'>{previewSubject}</div>
                </div>
                <div>
                  <div className='text-sm text-secondary-content mb-1'>
                    Body:
                  </div>
                  <div className='text-sm leading-relaxed text-black'>
                    {previewBody ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            normalizeHtml(String(previewBody))
                          ),
                        }}
                      />
                    ) : (
                      <span className='text-secondary-content'>
                        (No content)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Send Campaign</CardTitle>
          <CardDescription>
            Ready to send? Review the details above and click send to start your
            campaign.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {isSending && (
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'></div>
                <span className='text-sm text-secondary-content'>
                  Sending emails...
                </span>
              </div>
              <Progress value={progress} />
              <div className='text-sm text-secondary-content text-center'>
                {Math.round((progress / 100) * recipients.length)} of{" "}
                {recipients.length} sent
              </div>
            </div>
          )}

          <Button
            onClick={handleSend}
            disabled={!isReady || isSending}
            size='lg'
            className='w-full'
          >
            <Send className='mr-2 h-4 w-4' />
            {isSending
              ? "Sending..."
              : `Send to ${recipients.length} Recipients`}
          </Button>

          {/* To be removed when the api endpoint is ready */}
          <Alert>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              This will send a POST request to /api/send-emails with your
              campaign data. A confirmation dialog will appear before sending.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Confirm Email Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to send this email campaign? This action{" "}
              <strong>CANNOT</strong> be undone.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-secondary-content'>
                  Recipients:
                </span>
                <span className='font-medium'>{recipients.length}</span>
              </div>
              <div className='flex justify-between items-start'>
                <span className='text-sm text-secondary-content'>Subject:</span>
                <span className='font-medium text-right max-w-64 break-words'>
                  {template.subject}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSend}
              className='bg-blue-600 hover:bg-blue-700'
            >
              <Send className='mr-2 h-4 w-4' />
              Send Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
