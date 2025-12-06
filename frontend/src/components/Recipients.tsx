import { useState } from 'react';
import { CrudTable } from './CrudTable';
import { CrudDialog } from './CrudDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { useRecipients, type Recipient } from '@/lib/useRecipients';

const RECIPIENT_FIELDS = [
  { key: 'name', label: 'Name', type: 'text' as const, required: true, placeholder: 'Enter recipient name' },
  { 
    key: 'emails', 
    label: 'Emails', 
    type: 'textarea' as const, 
    required: true, 
    placeholder: 'Enter emails (one per line or comma-separated)',
    helperText: 'You can enter multiple emails separated by commas or new lines'
  },
];

const RECIPIENT_COLUMNS = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
  },
  {
    key: 'emails',
    header: 'Emails',
    sortable: false,
    render: (recipient: Recipient) =>
      recipient.emails ? recipient.emails.join(', ') : 'N/A',
  },
  {
    key: 'createdAt',
    header: 'Added',
    sortable: true,
    render: (recipient: Recipient) =>
      recipient.createdAt ? new Date(recipient.createdAt).toLocaleDateString() : 'N/A',
  },
];

export function Recipients() {
  const { recipients, loading, createRecipient, updateRecipient, deleteRecipient } = useRecipients();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleAdd = () => {
    setSelectedRecipient(null);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEdit = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<Recipient>) => {
    // Parse emails from textarea (comma or newline separated) into array
    const processedData = { ...data };
    if (typeof processedData.emails === 'string') {
      processedData.emails = (processedData.emails as string)
        .split(/[,\n]+/)
        .map(email => email.trim())
        .filter(email => email.length > 0);
    }

    if (isEditing && selectedRecipient?._id) {
      await updateRecipient(selectedRecipient._id, processedData);
    } else {
      await createRecipient(processedData as Omit<Recipient, '_id' | 'createdAt' | 'updatedAt'>);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedRecipient?._id) {
      await deleteRecipient(selectedRecipient._id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-foreground">Recipients</h1>
        <p className="text-muted-foreground">
          Manage your email recipients for campaigns and communications.
        </p>
      </div>

      <CrudTable
        data={recipients}
        columns={RECIPIENT_COLUMNS}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search recipients..."
        addButtonText="Add Recipient"
        defaultSortColumn="name"
        defaultSortDirection="asc"
      />

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={isEditing ? 'Edit Recipient' : 'Add Recipient'}
        description={isEditing ? 'Update the recipient details below.' : 'Add a new email recipient.'}
        fields={RECIPIENT_FIELDS}
        initialData={
          selectedRecipient 
            ? ({ 
                ...selectedRecipient, 
                emails: Array.isArray(selectedRecipient.emails) 
                  ? selectedRecipient.emails.join('\n') 
                  : selectedRecipient.emails 
              } as unknown as Partial<Recipient>)
            : {}
        }
        onSubmit={handleSubmit}
        submitButtonText={isEditing ? 'Update Recipient' : 'Create Recipient'}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Recipient"
        description={`Are you sure you want to delete "${selectedRecipient?.name}" (${selectedRecipient?.emails?.join(', ')})? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}