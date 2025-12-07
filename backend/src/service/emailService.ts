import nodemailer from "nodemailer";
import fs from "fs-extra";
import Handlebars from "handlebars";
import dotenv from "dotenv";

import {
  createEmailTemplateModel,
  listEmailTemplatesModel,
  getEmailTemplateModel,
  updateEmailTemplateModel,
  deleteEmailTemplateModel,
  findEmailTemplateByName,
  EmailTemplate,
  EmailTemplateDoc,
  SendResult
} from "../model/emailModel";
import { getRecipient } from "../model/recipientModel";
import { logEmailSend } from "./logService";
import type { RecipientStatus } from "../model/logModel";

dotenv.config();

export async function createEmailTemplate(data: EmailTemplate): Promise<EmailTemplateDoc> {
  if (!data?.name || !data?.subject || !data?.body) {
    throw new Error("Missing required fields: name, subject, body");
  }
  const existing = await findEmailTemplateByName(data.name);
  if (existing) {
    const err: any = new Error("Template name already exists");
    err.code = "DUPLICATE_NAME";
    throw err;
  }
  return createEmailTemplateModel(data);
}

export async function listEmailTemplates(): Promise<EmailTemplateDoc[]> {
  const templates = await listEmailTemplatesModel();
  // Decode base64 body to HTML for each template
  return templates.map(template => {
    if (template.body) {
      template.body = Buffer.from(template.body, 'base64').toString('utf-8');
    }
    return template;
  });
}

export async function getEmailTemplate(id: string): Promise<EmailTemplateDoc | null> {
  const template = await getEmailTemplateModel(id);
  if (template && template.body) {
    // Decode base64 body to HTML
    template.body = Buffer.from(template.body, 'base64').toString('utf-8');
  }
  return template;
}

export async function updateEmailTemplate(
  id: string,
  data: Partial<EmailTemplate>
): Promise<EmailTemplateDoc | null> {
  if (typeof data?.name === "string" && data.name.trim() === "") {
    throw new Error("Name cannot be empty");
  }
  if (data?.name) {
    const existing = await findEmailTemplateByName(data.name);
    if (existing && existing._id.toString() !== id) {
      const err: any = new Error("Template name already exists");
      err.code = "DUPLICATE_NAME";
      throw err;
    }
  }
  return updateEmailTemplateModel(id, data);
}

export async function deleteEmailTemplate(id: string): Promise<boolean> {
  return deleteEmailTemplateModel(id);
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  logger: true,
  debug: true,
});

export async function sendEmailCampaign(templateId: string, recipientIds: string[], variables: Record<string, any> = {}) {
  // Fetch template
  const template = await getEmailTemplateModel(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  // Decode base64 body to HTML
  const htmlBody = Buffer.from(template.body, 'base64').toString('utf-8');

  // Fetch recipients
  const recipients = await Promise.all(
    recipientIds.map(async (id) => {
      const recipient = await getRecipient(id);
      if (!recipient) {
        throw new Error(`Recipient not found: ${id}`);
      }
      return recipient;
    })
  );

  const startedAt = new Date();
  const results: SendResult[] = [];

  // Send to each recipient (group send to all their emails)
  for (const recipient of recipients) {
    try {
      // Merge frontend variables with recipient name (recipient name always overrides)
      const templateVariables = {
        ...variables,
        recipient: recipient.name,
      };

      // Compile HTML with Handlebars
      const compiled = Handlebars.compile(htmlBody);
      const html = compiled(templateVariables);

      // Prepare attachments if any
      const attachments = template.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        encoding: 'base64' as const,
        contentType: att.contentType,
      })) || [];

      // Send email to all addresses for this recipient (group send)
      const info = await transporter.sendMail({
        from: `${process.env.GMAIL_NAME} <${process.env.GMAIL_USER}>`,
        to: recipient.emails.join(', '), // Send to all emails for this recipient
        subject: template.subject,
        html,
        attachments,
      });

      // Record result for each email in the group
      for (const email of recipient.emails) {
        results.push({ to: email, info });
      }
    } catch (err) {
      // Record error for each email in the group
      for (const email of recipient.emails) {
        results.push({ to: email, error: err });
      }
      console.error(`Failed to send email to ${recipient.name} (${recipient.emails.join(', ')}):`, err);
    }
  }

  const completedAt = new Date();
  const successCount = results.filter((r) => r.info).length;
  const failedCount = results.length - successCount;

  // Log the campaign
  const perRecipient: RecipientStatus[] = results.map((r) => ({
    email: r.to,
    status: r.info ? "sent" : "failed",
    error: r.error ? String(r.error) : undefined,
  }));

  const bodyPreview = htmlBody.substring(0, 200);

  try {
    await logEmailSend({
      templateName: template.name,
      subject: template.subject,
      bodyPreview,
      recipients: recipients.map((r: any) => ({ name: r.name, email: r.email })),
      perRecipient,
      recipientCount: recipients.length,
      successCount,
      failedCount,
      startedAt,
      completedAt,
      durationMs: completedAt.getTime() - startedAt.getTime(),
      meta: { templateId },
    });
  } catch (error_) {
    console.error("Failed to log email campaign:", error_);
  }

  return {
    success: true,
    sent: successCount,
    failed: failedCount,
    total: recipients.length,
    results: perRecipient,
  };
}