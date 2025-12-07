import { useState } from 'react';
import { CrudTable } from './CrudTable';
import { CrudDialog } from './CrudDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { TemplateDetailsDialog } from './TemplateDetailsDialog';
import { useTemplates, type EmailTemplate } from '@/lib/useTemplates';

const TEMPLATE_FIELDS = [
  { key: 'name', label: 'Name', type: 'text' as const, required: true, placeholder: 'Enter template name' },
  { key: 'subject', label: 'Subject', type: 'text' as const, required: true, placeholder: 'Enter email subject' },
  { key: 'body', label: 'HTML File', type: 'file' as const, required: true, accept: '.html', placeholder: 'Select HTML file' },
  { key: 'attachments', label: 'Attachments', type: 'file' as const, required: false, accept: '*', multiple: true, placeholder: 'Select files to attach (optional)', helperText: 'You can select multiple files to attach to the email' },
];

const TEMPLATE_COLUMNS = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
  },
  {
    key: 'subject',
    header: 'Subject',
    sortable: true,
  },
  {
    key: 'createdAt',
    header: 'Created',
    sortable: true,
    render: (template: EmailTemplate) =>
      template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A',
  },
];

export function Templates() {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useTemplates();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleAdd = () => {
    setSelectedTemplate(null);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const handleRowClick = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setDetailsDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<EmailTemplate>) => {
    if (isEditing && selectedTemplate?._id) {
      await updateTemplate(selectedTemplate._id, data);
    } else {
      await createTemplate(data as Omit<EmailTemplate, '_id' | 'createdAt' | 'updatedAt'>);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedTemplate?._id) {
      await deleteTemplate(selectedTemplate._id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-foreground">Email Templates</h1>
        <p className="text-muted-foreground">
          Manage your email templates for campaigns and communications.
        </p>
      </div>

      <CrudTable
        data={templates}
        columns={TEMPLATE_COLUMNS}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRowClick={handleRowClick}
        searchPlaceholder="Search templates..."
        addButtonText="Add Template"
        defaultSortColumn="name"
        defaultSortDirection="asc"
      />

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={isEditing ? 'Edit Template' : 'Add Template'}
        description={isEditing ? 'Update the template details below.' : 'Create a new email template.'}
        fields={TEMPLATE_FIELDS}
        initialData={selectedTemplate || {}}
        onSubmit={handleSubmit}
        submitButtonText={isEditing ? 'Update Template' : 'Create Template'}
        isEditing={isEditing}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Template"
        description={`Are you sure you want to delete "${selectedTemplate?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
      />

      <TemplateDetailsDialog
        template={selectedTemplate}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  );
}