import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

export type Recipient = {
  _id?: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

export function useRecipients() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/v1/recipients');
      setRecipients(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recipients';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createRecipient = async (recipient: Omit<Recipient, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await api.post('/v1/recipients', recipient);
      setRecipients(prev => [response.data, ...prev]);
      toast.success('Recipient created successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create recipient';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateRecipient = async (id: string, recipient: Partial<Recipient>) => {
    try {
      const response = await api.put(`/v1/recipients/${id}`, recipient);
      setRecipients(prev => prev.map(r => r._id === id ? response.data : r));
      toast.success('Recipient updated successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update recipient';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteRecipient = async (id: string) => {
    try {
      await api.delete(`/v1/recipients/${id}`);
      setRecipients(prev => prev.filter(r => r._id !== id));
      toast.success('Recipient deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete recipient';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, []);

  return {
    recipients,
    loading,
    error,
    refetch: fetchRecipients,
    createRecipient,
    updateRecipient,
    deleteRecipient,
  };
}