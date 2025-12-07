import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface Attachment {
  filename: string;
  content: string; // base64 encoded
  contentType: string;
}

export type EmailTemplate = {
  _id?: string;
  name: string;
  subject: string;
  body: string;
  attachments?: Attachment[];
  createdAt?: string;
  updatedAt?: string;
};

export function useTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/v1/emails');
      setTemplates(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Omit<EmailTemplate, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await api.post('/v1/emails', template);
      setTemplates(prev => [response.data, ...prev]);
      toast.success('Template created successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateTemplate = async (id: string, template: Partial<EmailTemplate>) => {
    try {
      const response = await api.put(`/v1/emails/${id}`, template);
      setTemplates(prev => prev.map(t => t._id === id ? response.data : t));
      toast.success('Template updated successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await api.delete(`/v1/emails/${id}`);
      setTemplates(prev => prev.filter(t => t._id !== id));
      toast.success('Template deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}