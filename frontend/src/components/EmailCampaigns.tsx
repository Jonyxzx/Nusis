import { useState, useRef } from "react";
import { EmailTemplateEditor, type EmailTemplate } from "./EmailTemplateEditor";
import { EmailRecipients, type Recipient } from "./EmailRecipients";
import { SendEmails } from "./SendEmails";
import { type EmailLog } from "./EmailHistory";
import { toast } from "sonner";
import { Edit3, Users, Send, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useEmailLogs } from "@/lib/emailLogsStore";

const STEP_TITLES = ["Template", "Recipients", "Review & Send"] as const;

export function EmailCampaigns() {
  const [template, setTemplate] = useState<EmailTemplate>({
    subject: "",
    body: "",
    name: "",
  });
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const { logs, addLog } = useEmailLogs();
  const [templateSaved, setTemplateSaved] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  // dedupe recent selections to avoid duplicate toasts when effects fire twice
  const lastSelectRef = useRef<{ key: string; ts: number } | null>(null);

  // template selection handled inline via onSelect below

  const handleSendEmails = () => {
    const newLog: EmailLog = {
      id: Date.now().toString(),
      subject: template.subject,
      recipientCount: recipients.length,
      sentAt: new Date().toISOString(),
      status: "sent",
    };

    addLog(newLog);
    toast.success(`Campaign sent to ${recipients.length} recipients!`);
  };

  const nextStep = () =>
    setCurrentStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  // completion rules:
  // step 0 (Template) is complete when `templateSaved` is true
  // step 1 (Recipients) is complete when there is at least one recipient
  // step 2 (Review & Send) is considered "allowed" when recipients exist (you can review),
  // but sending is an explicit action handled by the SendEmails component; history (step 3)
  // becomes available after a campaign has been sent (emailLogs.length > 0)
  const step0Complete = templateSaved;
  const step1Complete = recipients.length > 0;
  const step2Complete = logs.length > 0; // indicates a campaign has been sent

  // compute the highest step the user is allowed to jump to (forward)
  let allowedStep = 0;
  if (step0Complete) allowedStep = Math.max(allowedStep, 1);
  if (step1Complete) allowedStep = Math.max(allowedStep, 2);
  if (step2Complete) allowedStep = Math.max(allowedStep, 2);

  const canAdvanceFrom = (step: number) => {
    if (step === 0) return step0Complete;
    if (step === 1) return step1Complete;
    // on the review step, sending is done via the child component, so Next should be disabled
    // to avoid confusion; SendEmails will call onSend and navigate to History when done.
    if (step === 2) return false;
    return false;
  };

  return (
    <div className='wizard'>
      {/* Timeline step indicator */}
      <nav aria-label='Email campaign steps'>
        <ul className='wizard-list'>
          {STEP_TITLES.map((title, idx) => {
            const active = idx === currentStep;
            const completed =
              idx < currentStep ||
              (idx === 0 && step0Complete && currentStep > 0);
            const disabled = idx > allowedStep;
            const Icon = idx === 0 ? Edit3 : idx === 1 ? Users : Send;

            return (
              <li key={title} className='wizard-step'>
                {/* left connector */}
                {idx > 0 && (
                  <div
                    className={`wizard-connector ${
                      idx <= currentStep ? "completed" : ""
                    }`}
                  />
                )}

                {/* step circle + label (label absolutely positioned so it doesn't affect connector alignment) */}
                <div className='relative px-3 flex items-center justify-center'>
                  <div
                    aria-current={active ? "step" : undefined}
                    aria-disabled={disabled}
                    role='img'
                    aria-label={title}
                  >
                    <div
                      className={`wizard-circle ${active ? "active" : ""} ${
                        completed ? "completed" : ""
                      }`}
                    >
                      {completed ? (
                        <Check className='h-5 w-5' />
                      ) : (
                        <Icon className='h-5 w-5' />
                      )}
                    </div>
                  </div>
                  <div className='wizard-label'>{title}</div>
                </div>

                {/* right connector */}
                {idx < STEP_TITLES.length - 1 && (
                  <div
                    className={`wizard-connector ${
                      idx < currentStep ? "completed" : ""
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <section className='mt-10'>
        {currentStep === 0 && (
          <div className='mt-4'>
            <EmailTemplateEditor
              onSelect={(t) => {
                // dedupe identical incoming selections
                const key = `${t.subject || ""}||${t.body || ""}`;
                if (
                  lastSelectRef.current &&
                  lastSelectRef.current.key === key
                ) {
                  return;
                }
                lastSelectRef.current = { key, ts: Date.now() };

                setTemplate(t);
                // only mark the template step as complete when there is a real template
                const hasContent = Boolean(
                  (t.subject && t.subject.trim()) || (t.body && t.body.trim())
                );
                setTemplateSaved(hasContent);
                if (hasContent) toast.success("Template selected");
              }}
              initialTemplate={template}
            />
          </div>
        )}

        {currentStep === 1 && (
          <div className='mt-4'>
            <EmailRecipients
              recipients={recipients}
              onRecipientsChange={setRecipients}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className='mt-4'>
            <SendEmails
              template={template}
              recipients={recipients}
              onSend={handleSendEmails}
            />
          </div>
        )}
      </section>

      {/* Navigation controls */}
      <div className='wizard-controls'>
        <div>
          <Button
            type='button'
            onClick={prevStep}
            disabled={currentStep === 0}
            variant={"back"}
            size={"sm"}
          >
            Back
          </Button>
          {currentStep !== STEP_TITLES.length - 1 && (
            <Button
              type='button'
              onClick={() => {
                // Only advance when current step is allowed to advance
                if (canAdvanceFrom(currentStep)) nextStep();
              }}
              disabled={!canAdvanceFrom(currentStep)}
              size={"sm"}
            >
              Next
            </Button>
          )}

          {/* helper message when Next is disabled */}
          {!canAdvanceFrom(currentStep) && (
            <div className='wizard-helper'>
              {currentStep === 0 && "Please select a template to continue."}
              {currentStep === 1 &&
                "Please add at least one recipient to continue."}
            </div>
          )}
        </div>

        <div className='text-sm text-gray-600'>
          Step {currentStep + 1} of {STEP_TITLES.length}
        </div>
      </div>
    </div>
  );
}
