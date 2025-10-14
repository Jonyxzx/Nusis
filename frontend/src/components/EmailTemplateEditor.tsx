import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Save, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

export interface EmailTemplate {
  subject: string;
  body: string;
  fromName: string;
  fromEmail: string;
}

interface EmailTemplateEditorProps {
  onSave: (template: EmailTemplate) => void;
  initialTemplate?: EmailTemplate;
}

export function EmailTemplateEditor({ onSave, initialTemplate }: EmailTemplateEditorProps) {
  const [template, setTemplate] = useState<EmailTemplate>(
    initialTemplate || {
      subject: '',
      body: '',
      fromName: 'Admin',
      fromEmail: 'admin@example.com',
    }
  );

  const handleSave = () => {
    onSave(template);
  };

  const variables = [
    { name: '{{firstName}}', description: 'Recipient first name' },
    { name: '{{lastName}}', description: 'Recipient last name' },
    { name: '{{email}}', description: 'Recipient email' },
    { name: '{{companyName}}', description: 'Company name' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Template</CardTitle>
          <CardDescription>
            Create and customize your email template. Use variables to personalize emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                value={template.fromName}
                onChange={(e) => setTemplate({ ...template, fromName: e.target.value })}
                placeholder="Your Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                value={template.fromEmail}
                onChange={(e) => setTemplate({ ...template, fromEmail: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              value={template.subject}
              onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
              placeholder="Enter email subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Email Body</Label>
            <Textarea
              id="body"
              value={template.body}
              onChange={(e) => setTemplate({ ...template, body: e.target.value })}
              placeholder="Enter email content..."
              className="min-h-[300px]"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Template
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Email Preview</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-secondary-content">From:</div>
                    <div className="text-primary-content">{template.fromName} &lt;{template.fromEmail}&gt;</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-content">Subject:</div>
                    <div className="text-primary-content">{template.subject || '(No subject)'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-content mb-2">Body:</div>
                    <div className="preview-box whitespace-pre-wrap text-primary-content">
                      {template.body || '(No content)'}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Variables</CardTitle>
          <CardDescription>
            Insert these variables into your template to personalize emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {variables.map((variable) => (
              <div key={variable.name} className="flex items-center gap-2">
                <code className="px-2 py-1 bg-muted border border-border rounded text-sm text-primary">{variable.name}</code>
                <span className="text-sm text-secondary-content">{variable.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
