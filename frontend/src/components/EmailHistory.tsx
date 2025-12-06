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
import { Mail, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useEmailLogs } from "@/lib/emailLogsStore";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export interface EmailLog {
  _id: string;
  templateName: string;
  subject: string;
  bodyPreview?: string;
  recipients: { name?: string; email: string }[];
  perRecipient?: {
    email: string;
    name?: string;
    status: "queued" | "sent" | "failed";
    error?: string;
    messageId?: string;
    sentAt?: Date;
  }[];
  recipientCount: number;
  successCount: number;
  failedCount: number;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  meta?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EmailHistoryProps {
  logs?: EmailLog[];
}

const ITEMS_PER_PAGE = 10;

// Status Badge Component
function StatusBadge({ log }: { log: EmailLog }) {
  const totalProcessed = log.successCount + log.failedCount;
  const isCompleted = totalProcessed === log.recipientCount;

  if (isCompleted) {
    if (log.failedCount === 0) {
      return (
        <Badge variant='default' className='bg-green-100 text-green-800'>
          <CheckCircle className='w-3 h-3 mr-1' />
          Completed
        </Badge>
      );
    } else if (log.successCount === 0) {
      return (
        <Badge variant='destructive'>
          <XCircle className='w-3 h-3 mr-1' />
          Failed
        </Badge>
      );
    } else {
      return (
        <Badge variant='secondary'>
          <AlertCircle className='w-3 h-3 mr-1' />
          Partial
        </Badge>
      );
    }
  } else {
    return (
      <Badge variant='secondary'>
        <Clock className='w-3 h-3 mr-1' />
        In Progress
      </Badge>
    );
  }
}

// Recipients Tooltip Component
function RecipientsTooltip({ log }: { log: EmailLog }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className='cursor-help underline decoration-dotted text-blue-600'>
          {log.recipientCount} recipient{log.recipientCount !== 1 ? "s" : ""}
        </span>
      </TooltipTrigger>
      <TooltipContent className='max-w-sm p-4' side='top'>
        <div className='space-y-2'>
          <div className='font-semibold text-sm mb-2'>Recipients:</div>
          <div className='max-h-48 overflow-y-auto space-y-1'>
            {log.recipients.map((recipient, index) => (
              <div
                key={index}
                className='flex items-center justify-between text-xs'
              >
                <div className='flex-1 min-w-0'>
                  <div className='font-medium truncate'>
                    {recipient.name || "No name"}
                  </div>
                  <div className='text-gray-500 truncate'>
                    {recipient.email}
                  </div>
                </div>
                {log.perRecipient && log.perRecipient[index] && (
                  <Badge
                    variant={
                      log.perRecipient[index].status === "sent"
                        ? "default"
                        : log.perRecipient[index].status === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                    className='ml-2 text-xs px-1.5 py-0.5'
                  >
                    {log.perRecipient[index].status}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Email Log Row Component
function EmailLogRow({ log }: { log: EmailLog }) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <TableRow key={log._id}>
      <TableCell className='font-medium'>{log.templateName}</TableCell>
      <TableCell className='max-w-xs truncate' title={log.subject}>
        {log.subject}
      </TableCell>
      <TableCell>
        <RecipientsTooltip log={log} />
      </TableCell>
      <TableCell className='text-sm text-muted-foreground'>
        {log.completedAt ? formatDate(log.completedAt) : "In Progress"}
      </TableCell>
      <TableCell>
        <StatusBadge log={log} />
      </TableCell>
    </TableRow>
  );
}

// Custom hook for email logs
function useEmailLogsData() {
  const [fetched, setFetched] = useState<EmailLog[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/v1/logs")
      .then((res) => {
        if (!mounted) return;
        setFetched(res.data ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setFetched([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { fetched, loading };
}

// Pagination Component
function EmailHistoryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className='mt-6'>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className='cursor-pointer'
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

// Loading State Component
function EmailHistoryLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email History</CardTitle>
        <CardDescription>Loading email history...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='text-center py-12'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4'></div>
          <div className='text-muted-foreground'>Loading...</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty State Component
function EmailHistoryEmpty() {
  return (
    <div className='text-center py-12'>
      <Mail className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
      <div className='text-secondary-content'>No emails sent yet</div>
      <div className='text-sm text-muted-foreground mt-2'>
        Your sent emails will appear here
      </div>
    </div>
  );
}

export function EmailHistory({ logs }: EmailHistoryProps) {
  const ctx = useEmailLogs();
  const { fetched, loading } = useEmailLogsData();
  const [currentPage, setCurrentPage] = useState(1);

  const effectiveLogs = logs ?? fetched ?? ctx.logs;

  // Pagination logic
  const totalPages = Math.ceil(effectiveLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogs = effectiveLogs.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <EmailHistoryLoading />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email History</CardTitle>
        <CardDescription>
          View all sent email campaigns ({effectiveLogs.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {effectiveLogs.length === 0 ? (
          <EmailHistoryEmpty />
        ) : (
          <>
            <div className='data-table'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map((log) => (
                    <EmailLogRow key={log._id} log={log} />
                  ))}
                </TableBody>
              </Table>
            </div>

            <EmailHistoryPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
