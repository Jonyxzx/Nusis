import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Field {
  key: string;
  label: string;
  type: "text" | "email" | "textarea" | "file";
  required?: boolean;
  placeholder?: string;
  accept?: string; // For file inputs
  multiple?: boolean; // For multiple file uploads
  helperText?: string; // Helper text for the field
}

interface CrudDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: Field[];
  initialData?: Partial<T>;
  onSubmit: (data: Partial<T>) => Promise<void>;
  submitButtonText?: string;
  loading?: boolean;
  isEditing?: boolean; // Add this to know if we're editing
}

export function CrudDialog<T extends Record<string, unknown>>({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialData = {},
  onSubmit,
  submitButtonText = 'Save',
  loading = false,
  isEditing = false,
}: CrudDialogProps<T>) {
  const [formData, setFormData] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileContents, setFileContents] = useState<Record<string, string>>({});

  useEffect(() => {
    // When editing, don't pre-fill the body field to avoid showing current content
    const filteredData = isEditing
      ? Object.fromEntries(
          Object.entries(initialData).filter(([key]) => key !== 'body')
        ) as Partial<T>
      : initialData;
    setFormData(filteredData);
    setErrors({});
    setFileContents({});
  }, [initialData, open, isEditing]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required && !formData[field.key]?.toString().trim()) {
        newErrors[field.key] = `${field.label} is required`;
      }

      if (field.type === "email" && formData[field.key]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.key] as string)) {
          newErrors[field.key] = "Please enter a valid email address";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleFileChange = async (key: string, file: File | null) => {
    if (!file) {
      setFormData((prev) => ({ ...prev, [key]: "" }));
      setFileContents((prev) => ({ ...prev, [key]: "" }));
      return;
    }

    // Validate file type for body field only
    if (key === 'body' && !file.name.toLowerCase().endsWith(".html")) {
      setErrors((prev) => ({
        ...prev,
        [key]: "Please select an HTML file (.html)",
      }));
      return;
    }

    try {
      const content = await file.text();
      // Encode body to base64 before sending to backend
      const encodedContent = key === 'body' ? btoa(unescape(encodeURIComponent(content))) : content;
      setFormData((prev) => ({ ...prev, [key]: encodedContent }));
      setFileContents((prev) => ({ ...prev, [key]: file.name }));
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: "" }));
      }
    } catch (error) {
      console.error('File upload error:', error);
      setErrors((prev) => ({ ...prev, [key]: "Failed to read file" }));
    }
  };

  const handleMultipleFilesChange = async (key: string, files: FileList | null) => {
    if (!files || files.length === 0) {
      setFormData((prev) => ({ ...prev, [key]: [] }));
      setFileContents((prev) => ({ ...prev, [key]: "" }));
      return;
    }

    try {
      const attachments = await Promise.all(
        Array.from(files).map(async (file) => {
          const content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              // Extract base64 content (remove data:mime;base64, prefix)
              const base64 = result.split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          return {
            filename: file.name,
            content,
            contentType: file.type || 'application/octet-stream',
          };
        })
      );

      setFormData((prev) => ({ ...prev, [key]: attachments }));
      setFileContents((prev) => ({ 
        ...prev, 
        [key]: files.length === 1 ? files[0].name : `${files.length} files selected`
      }));
      
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: "" }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, [key]: "Failed to read files" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]' style={{ maxWidth: "500px" }}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            {fields.map((field) => (
              <div
                key={field.key}
                className='grid grid-cols-4 items-center gap-4'
              >
                <Label htmlFor={field.key} className='text-right'>
                  {field.label}
                  {field.required && (
                    <span className='text-destructive ml-1'>*</span>
                  )}
                </Label>
                <div className='col-span-3'>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.key}
                      value={(formData[field.key] as string) || ""}
                      onChange={(e) =>
                        handleInputChange(field.key, e.target.value)
                      }
                      placeholder={field.placeholder}
                      className={errors[field.key] ? "border-destructive" : ""}
                      rows={4}
                    />
                  ) : field.type === "file" ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-muted-foreground">
                            {fileContents[field.key] || "No file chosen"}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          <label
                            htmlFor={field.key}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 border border-input rounded-md cursor-pointer transition-colors"
                          >
                            Choose {field.multiple ? "Files" : "File"}
                            <Input
                              id={field.key}
                              type="file"
                              accept={field.accept || ".html"}
                              multiple={field.multiple || false}
                              onChange={(e) => {
                                if (field.multiple) {
                                  handleMultipleFilesChange(field.key, e.target.files);
                                } else {
                                  const file = e.target.files?.[0] || null;
                                  handleFileChange(field.key, file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                      {field.helperText && (
                        <span className="text-xs text-muted-foreground">{field.helperText}</span>
                      )}
                    </div>
                  ) : (
                    <Input
                      id={field.key}
                      type={field.type}
                      value={(formData[field.key] as string) || ""}
                      onChange={(e) =>
                        handleInputChange(field.key, e.target.value)
                      }
                      placeholder={field.placeholder}
                      className={errors[field.key] ? "border-destructive" : ""}
                    />
                  )}
                  {errors[field.key] && (
                    <p className='text-sm text-destructive mt-1'>
                      {errors[field.key]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? "Saving..." : submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
