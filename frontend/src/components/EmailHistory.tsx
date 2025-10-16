import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Mail } from "lucide-react";
import { useEmailLogs } from "@/lib/emailLogsStore";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export interface EmailLog {
  id: string;
  subject: string;
  recipientCount: number;
  sentAt: string;
  status: "sent" | "failed" | "pending";
}

interface EmailHistoryProps {
  logs?: EmailLog[];
}

export function EmailHistory({ logs }: EmailHistoryProps) {
  const ctx = useEmailLogs();
  const [fetched, setFetched] = useState<EmailLog[] | null>(null);

  useEffect(() => {
    let mounted = true;
    api
      .get("/api/email-history")
      .then((res) => {
        if (!mounted) return;
        setFetched(res.data?.logs ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setFetched([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const effectiveLogs = logs ?? fetched ?? ctx.logs;
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant='default'>Sent</Badge>;
      case "failed":
        return <Badge variant='destructive'>Failed</Badge>;
      case "pending":
        return <Badge variant='secondary'>Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email History</CardTitle>
        <CardDescription>View all sent emails</CardDescription>
      </CardHeader>
      <CardContent>
        {effectiveLogs.length === 0 ? (
          <div className='text-center py-12'>
            <Mail className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <div className='text-secondary-content'>No emails sent yet</div>
            <div className='text-sm text-muted-foreground mt-2'>
              Your sent emails will appear here
            </div>
          </div>
        ) : (
          <div className='data-table'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {effectiveLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.subject}</TableCell>
                    <TableCell>{log.recipientCount}</TableCell>
                    <TableCell>
                      {new Date(log.sentAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
