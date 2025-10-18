import { useState, useRef, useEffect } from "react";
import { EmailTemplateEditor, type EmailTemplate } from "./EmailTemplateEditor";
import { EmailRecipients, type Recipient } from "./EmailRecipients";
import { SendEmails } from "./SendEmails";
import { type EmailLog } from "./EmailHistory";
import { toast } from "sonner";
import { Edit3, Users, Send, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useEmailLogs } from "@/lib/emailLogsStore";

const STEP_TITLES = ["Template", "Recipients", "Review & Send"] as const;
const STEP_ICONS = [Edit3, Users, Send] as const;

// Custom hook for scroll animation
function useScrollAnimation(currentStep: number) {
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (isScrollingRef.current) return;

    isScrollingRef.current = true;

    // Prevent user scrolling during animation
    const preventScroll = (e: Event) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", preventKeys);

    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    const viewportHeight = window.innerHeight;

    // Temporarily extend page height for short pages
    let cleanupHeight: (() => void) | null = null;
    if (documentHeight <= viewportHeight + 50) {
      const originalMinHeight = document.body.style.minHeight;
      const originalBackgroundColor = document.body.style.backgroundColor;
      document.body.style.minHeight = `${viewportHeight + 500}px`;

      const appContainer = document.querySelector('.admin-content');
      if (appContainer) {
        document.body.style.backgroundColor = getComputedStyle(appContainer).backgroundColor;
      }

      cleanupHeight = () => {
        document.body.style.minHeight = originalMinHeight;
        document.body.style.backgroundColor = originalBackgroundColor;
      };

      setTimeout(cleanupHeight, 550);
    }

    // Perform scroll animation
    const targetPosition = Math.min(300, Math.max(200, documentHeight - viewportHeight - 100));

    window.scrollTo({ top: targetPosition, behavior: "instant" });
    const afterScroll = window.scrollY;

    if (afterScroll === 0 || afterScroll < targetPosition * 0.8) {
      document.documentElement.scrollTop = document.body.scrollTop = targetPosition;
    }

    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);

    // Cleanup
    const cleanupScroll = () => {
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventKeys);
      isScrollingRef.current = false;
    };

    setTimeout(cleanupScroll, 500);

    return () => {
      cleanupScroll();
      cleanupHeight?.();
    };
  }, [currentStep]);
}

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

  // Dedupe recent selections to avoid duplicate toasts
  const lastSelectRef = useRef<{ key: string; ts: number } | null>(null);

  // Use scroll animation hook
  useScrollAnimation(currentStep);

  const handleSendEmails = () => {
    const newLog: EmailLog = {
      _id: Date.now().toString(),
      subject: template.subject,
      recipientCount: recipients.length,
      templateName: "",
      recipients: [],
      successCount: 0,
      failedCount: 0,
      startedAt: new Date()
    };

    addLog(newLog);
    toast.success(`Campaign sent to ${recipients.length} recipients!`);
  };

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  // Step completion logic
  const stepCompletions = [
    templateSaved, // Template step
    recipients.length > 0, // Recipients step
    logs.length > 0 // Review & Send step (campaign sent)
  ];

  const allowedStep = stepCompletions.findIndex(complete => !complete) - 1;

  const canAdvanceFrom = (step: number) => {
    if (step === 0) return stepCompletions[0];
    if (step === 1) return stepCompletions[1];
    return false; // Review step doesn't advance via Next
  };

  const getHelperMessage = (step: number) => {
    if (step === 0) return "Please select a template to continue.";
    if (step === 1) return "Please add at least one recipient to continue.";
    return "";
  };

  // Step indicator component
  const StepIndicator = ({ idx, title }: { idx: number; title: string }) => {
    const active = idx === currentStep;
    const completed = idx < currentStep || (idx === 0 && stepCompletions[0] && currentStep > 0);
    const disabled = idx > allowedStep;
    const Icon = STEP_ICONS[idx];

    return (
      <li className='wizard-step'>
        {idx > 0 && (
          <div className={`wizard-connector ${idx <= currentStep ? "completed" : ""}`} />
        )}

        <div className='relative px-3 flex items-center justify-center'>
          <div
            aria-current={active ? "step" : undefined}
            aria-disabled={disabled}
            role='img'
            aria-label={title}
          >
            <div className={`wizard-circle ${active ? "active" : ""} ${completed ? "completed" : ""}`}>
              {completed ? <Check className='h-5 w-5' /> : <Icon className='h-5 w-5' />}
            </div>
          </div>
          <div className='wizard-label'>{title}</div>
        </div>

        {idx < STEP_TITLES.length - 1 && (
          <div className={`wizard-connector ${idx < currentStep ? "completed" : ""}`} />
        )}
      </li>
    );
  };

  return (
    <div className='wizard'>
      <nav aria-label='Email campaign steps'>
        <ul className='wizard-list'>
          {STEP_TITLES.map((title, idx) => (
            <StepIndicator key={title} idx={idx} title={title} />
          ))}
        </ul>
      </nav>

      <section className='mt-10'>
        {currentStep === 0 && (
          <div className='mt-4'>
            <EmailTemplateEditor
              onSelect={(t) => {
                const key = `${t.subject || ""}||${t.body || ""}`;
                if (lastSelectRef.current?.key === key) return;
                lastSelectRef.current = { key, ts: Date.now() };

                setTemplate(t);
                const hasContent = Boolean((t.subject?.trim()) || (t.body?.trim()));
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

      <div className='wizard-controls'>
        <div>
          {currentStep > 0 && (
            <Button type='button' onClick={prevStep} variant="back" size="sm">
              Back
            </Button>
          )}
          {currentStep !== STEP_TITLES.length - 1 && (
            <Button
              type='button'
              onClick={() => canAdvanceFrom(currentStep) && nextStep()}
              disabled={!canAdvanceFrom(currentStep)}
              size="sm"
            >
              Next
            </Button>
          )}

          {!canAdvanceFrom(currentStep) && (
            <div className='wizard-helper'>
              {getHelperMessage(currentStep)}
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
