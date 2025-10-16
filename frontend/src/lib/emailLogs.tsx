import { useState } from 'react';
import type { ReactNode } from 'react';
import type { EmailLog } from '@/components/EmailHistory';
import { EmailLogsContext } from './emailLogsStore';

export function EmailLogsProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<EmailLog[]>([]);

  const addLog = (log: EmailLog) => setLogs((s) => [log, ...s]);

  return <EmailLogsContext.Provider value={{ logs, addLog }}>{children}</EmailLogsContext.Provider>;
}

