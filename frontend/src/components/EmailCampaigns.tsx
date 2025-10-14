import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EmailTemplateEditor, type EmailTemplate } from './EmailTemplateEditor';
import { EmailRecipients, type Recipient } from './EmailRecipients';
import { SendEmails } from './SendEmails';
import { EmailHistory, type EmailLog } from './EmailHistory';
import { toast } from 'sonner';

export function EmailCampaigns() {
  const [template, setTemplate] = useState<EmailTemplate>({
    subject: '',
    body: '',
    fromName: 'Admin',
    fromEmail: 'admin@example.com',
  });

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  const handleSaveTemplate = (newTemplate: EmailTemplate) => {
    setTemplate(newTemplate);
    toast.success('Template saved successfully!');
  };

  const handleSendEmails = () => {
    const newLog: EmailLog = {
      id: Date.now().toString(),
      subject: template.subject,
      recipientCount: recipients.length,
      sentAt: new Date().toISOString(),
      status: 'sent',
    };

    setEmailLogs([newLog, ...emailLogs]);
    toast.success(`Campaign sent to ${recipients.length} recipients!`);
  };

  return (
    <Tabs defaultValue="template" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="template">Template</TabsTrigger>
        <TabsTrigger value="recipients">Recipients</TabsTrigger>
        <TabsTrigger value="send">Send</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>

      <TabsContent value="template" className="mt-6">
        <EmailTemplateEditor onSave={handleSaveTemplate} initialTemplate={template} />
      </TabsContent>

      <TabsContent value="recipients" className="mt-6">
        <EmailRecipients recipients={recipients} onRecipientsChange={setRecipients} />
      </TabsContent>

      <TabsContent value="send" className="mt-6">
        <SendEmails template={template} recipients={recipients} onSend={handleSendEmails} />
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <EmailHistory logs={emailLogs} />
      </TabsContent>
    </Tabs>
  );
}
