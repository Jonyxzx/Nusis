import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { EmailTemplate } from "@/lib/useTemplates";
import DOMPurify from "dompurify";
import { extractBody, normalizeHtml } from "@/lib/emailTemplateUtils";

interface TemplateDetailsDialogProps {
  template: EmailTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateDetailsDialog({
  template,
  open,
  onOpenChange,
}: TemplateDetailsDialogProps) {
  if (!template) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='max-h-[100vh] overflow-y-auto'
        style={{ maxWidth: "900px" }}
      >
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            Template Details
            <Badge variant='outline'>{template.name}</Badge>
          </DialogTitle>
          <DialogDescription>
            Created: {formatDate(template.createdAt)} • Updated:{" "}
            {formatDate(template.updatedAt)}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <div>
              <h3 className='text-sm font-medium text-muted-foreground mb-2'>
                TEMPLATE NAME
              </h3>
              <p className='text-sm'>{template.name}</p>
            </div>

            <Separator />

            <div>
              <h3 className='text-sm font-medium text-muted-foreground mb-2'>
                SUBJECT
              </h3>
              <p className='text-sm font-medium'>{template.subject}</p>
            </div>

            <Separator />

            <div>
              <h3 className='text-sm font-medium text-muted-foreground mb-2'>
                EMAIL BODY
              </h3>
              <div
                className='text-sm border rounded-md p-4 bg-muted/50 max-h-64 overflow-y-auto'
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    normalizeHtml(String(extractBody(template.body)))
                  ),
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
