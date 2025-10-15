import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Trash2, Plus, Upload } from 'lucide-react';
import { Textarea } from './ui/textarea';

export interface Recipient {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  schoolName?: string;
}

interface EmailRecipientsProps {
  recipients: Recipient[];
  onRecipientsChange: (recipients: Recipient[]) => void;
}

export function EmailRecipients({ recipients, onRecipientsChange }: EmailRecipientsProps) {
  const [newEmail, setNewEmail] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');

  const addRecipient = () => {
    if (!newEmail) return;

    const newRecipient: Recipient = {
      id: Date.now().toString(),
      email: newEmail,
      firstName: newFirstName || undefined,
      lastName: newLastName || undefined,
      schoolName: newSchoolName || undefined,
    };

    onRecipientsChange([...recipients, newRecipient]);
    setNewEmail('');
    setNewFirstName('');
    setNewLastName('');
    setNewSchoolName('');
  };

  const removeRecipient = (id: string) => {
    onRecipientsChange(recipients.filter((r) => r.id !== id));
  };

  const addBulkRecipients = () => {
    const emails = bulkEmails
      .split('\n')
      .map((e) => e.trim())
      .filter((e) => e && e.includes('@'));

    const newRecipients: Recipient[] = emails.map((email) => ({
      id: Date.now().toString() + Math.random(),
      email,
    }));

    onRecipientsChange([...recipients, ...newRecipients]);
    setBulkEmails('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Recipient</CardTitle>
          <CardDescription>Add individual recipients with optional personalization fields</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="recipient@example.com"
                onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                placeholder="John"
                onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
                placeholder="Doe"
                onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                placeholder="National University of Singapore"
                onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
              />
            </div>
          </div>
          <Button onClick={addRecipient} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Recipient
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Import</CardTitle>
          <CardDescription>Add multiple email addresses (one per line)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
              className="min-h-[100px]"
            />
            <Button onClick={addBulkRecipients}>
              <Upload className="mr-2 h-4 w-4" />
              Import Emails
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recipients ({recipients.length})</CardTitle>
          <CardDescription>Manage your recipient list</CardDescription>
        </CardHeader>
        <CardContent>
          {recipients.length === 0 ? (
            <div className="text-center py-8 text-secondary-content">
              No recipients added yet. Add recipients using the form above.
            </div>
          ) : (
            <div className="data-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.map((recipient) => (
                    <TableRow key={recipient.id}>
                      <TableCell>{recipient.email}</TableCell>
                      <TableCell>{recipient.firstName || '-'}</TableCell>
                      <TableCell>{recipient.lastName || '-'}</TableCell>
                      <TableCell>{recipient.schoolName || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRecipient(recipient.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
