import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import DOMPurify from "dompurify";
import { extractBody, normalizeHtml } from "@/lib/emailTemplateUtils";
import { Label } from "./ui/label";
import api from "@/lib/api";

export interface EmailTemplate {
  name: string;
  subject: string;
  body: string;
  fromName?: string;
  fromEmail?: string;
}

interface EmailTemplateEditorProps {
  onSelect: (template: EmailTemplate) => void;
  initialTemplate?: EmailTemplate;
}

export function EmailTemplateEditor({
  onSelect,
  initialTemplate,
}: EmailTemplateEditorProps) {
  const [template, setTemplate] = useState<EmailTemplate>(
    initialTemplate || {
      name: "",
      subject: "",
      body: "",
      fromName: "",
      fromEmail: "",
    }
  );
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  // null == nothing selected yet; 'initial' == parent's template; otherwise index into templates
  const [selectedIndex, setSelectedIndex] = useState<number | "initial" | null>(
    initialTemplate && (initialTemplate.name || initialTemplate.subject)
      ? "initial"
      : null
  );

  useEffect(() => {
    let mounted = true;
    api
      .get("/v1/emails")
      .then((res) => {
        if (!mounted) return;
        const data = res.data ?? [];
        if (Array.isArray(data)) {
          // coerce bodies into strings so preview shows them
          const decoded = data.map((raw: unknown) => {
            const t = raw as Record<string, unknown>;
            const subject = (t.subject as string) ?? "";
            const name = (t.name as string) ?? "";
            const fromName = (t.fromName as string) ?? "";
            const fromEmail = (t.fromEmail as string) ?? "";

            // Extract/unwrap the body value (handles base64 and nested wrappers)
            const bodyStr = extractBody(t.body ?? t.html ?? t.content ?? "");

            return {
              name,
              subject,
              body: bodyStr,
              fromName,
              fromEmail,
            } as EmailTemplate;
          });
          const naturalCompare = (a: string, b: string) => {
            const regex = /(\d+)|(\D+)/g;
            const aParts = a.match(regex) || [];
            const bParts = b.match(regex) || [];
            for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
              const aPart = aParts[i] || "";
              const bPart = bParts[i] || "";
              const aNum = parseInt(aPart, 10);
              const bNum = parseInt(bPart, 10);
              if (!isNaN(aNum) && !isNaN(bNum)) {
                if (aNum !== bNum) return aNum - bNum;
              } else {
                const cmp = aPart.localeCompare(bPart);
                if (cmp !== 0) return cmp;
              }
            }
            return 0;
          };
          decoded.sort((a, b) => {
            const nameA = a.name || a.subject || "";
            const nameB = b.name || b.subject || "";
            return naturalCompare(nameA, nameB);
          });
          setTemplates(decoded);
        }
      })
      .catch(() => {
        // ignore, we'll show fallback templates
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Match initialTemplate to templates and set selectedIndex
  useEffect(() => {
    if (!initialTemplate || templates.length === 0) return;
    const idx = templates.findIndex((t) => {
      const iName = initialTemplate.name || "";
      const iSubject = initialTemplate.subject || "";
      const tName = t.name || "";
      const tSubject = t.subject || "";
      return (
        (iName && (iName === tName || iName === tSubject)) ||
        (iSubject && (iSubject === tName || iSubject === tSubject))
      );
    });
    if (idx >= 0) {
      setSelectedIndex(idx);
      setTemplate(templates[idx]);
    } else {
      if (
        initialTemplate &&
        (initialTemplate.name || initialTemplate.subject)
      ) {
        setSelectedIndex("initial");
      } else {
        setSelectedIndex(null);
      }
      setTemplate(initialTemplate);
    }
  }, [initialTemplate, templates]);

  useEffect(() => {
    if (templates.length === 0) {
      setTemplates([]);
    }
  }, [templates.length]);

  // NOTE: do not auto-select the first template — keep the blank/default option
  // so the preview shows no subject/body until the user explicitly picks one.

  useEffect(() => {
    if (selectedIndex === "initial" && initialTemplate) {
      setTemplate(initialTemplate);
      onSelect(initialTemplate);
    } else if (
      typeof selectedIndex === "number" &&
      selectedIndex >= 0 &&
      templates[selectedIndex]
    ) {
      const t = templates[selectedIndex];
      setTemplate(t);
      onSelect(t);
    }
  }, [selectedIndex, templates, onSelect, initialTemplate]);

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Email Template</CardTitle>
          <CardDescription>Choose the email template to send.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='templateSelect'>Choose Template</Label>
            <select
              id='templateSelect'
              className='w-full bg-white text-black border rounded px-2 py-1'
              style={{ color: "#000" }}
              value={
                selectedIndex === null
                  ? ""
                  : selectedIndex === "initial"
                  ? "initial"
                  : String(selectedIndex)
              }
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") {
                  // blank selection -> notify parent once
                  setSelectedIndex(null);
                  const empty = {
                    name: "",
                    subject: "",
                    body: "",
                    fromName: "",
                    fromEmail: "",
                  };
                  setTemplate(empty);
                  onSelect(empty);
                  return;
                }
                if (v === "initial") {
                  setSelectedIndex("initial");
                  return; // template and onSelect handled by useEffect
                }
                const idx = Number(v);
                if (!Number.isNaN(idx) && templates[idx]) {
                  // only set the index here; the effect listening to selectedIndex will
                  // set the template state *and* call onSelect exactly once.
                  setSelectedIndex(idx);
                }
              }}
            >
              <option value=''>-- Choose a template --</option>
              {selectedIndex === "initial" &&
                initialTemplate &&
                (initialTemplate.name || initialTemplate.subject) && (
                  <option value='initial'>
                    {initialTemplate.name || initialTemplate.subject}
                  </option>
                )}
              {templates.map((t, i) => (
                <option key={i} value={String(i)} className='text-black'>
                  {t.name || t.subject || `Template ${i + 1}`}
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-2'>
            <Label>Preview</Label>
            <div className='preview-box p-4 border rounded bg-white'>
              <div className='text-sm text-gray-600'>From:</div>
              <div className='text-black mb-3'>
                {template.fromName || template.fromEmail
                  ? `${template.fromName || ""} <${template.fromEmail || ""}>`
                  : "(No sender)"}
              </div>
              <div className='text-sm text-gray-600'>Subject:</div>
              <div className='text-black mb-3'>
                {template.subject || "(No subject)"}
              </div>
              <div className='text-sm text-gray-600'>Body:</div>
              <div className='text-black'>
                {template.body ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        normalizeHtml(String(template.body))
                      ),
                    }}
                  />
                ) : (
                  "(No content)"
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
