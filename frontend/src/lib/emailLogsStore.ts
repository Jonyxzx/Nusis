import { createContext, useContext } from 'react';
import type { EmailLog } from '@/components/EmailHistory';

interface EmailLogsContextValue {
  logs: EmailLog[];
  addLog: (log: EmailLog) => void;
}

export const EmailLogsContext = createContext<EmailLogsContextValue | undefined>(undefined);

export function useEmailLogs() {
  const ctx = useContext(EmailLogsContext);
  if (!ctx) throw new Error('useEmailLogs must be used within EmailLogsProvider');
  return ctx;
}

export default { EmailLogsContext, useEmailLogs };
