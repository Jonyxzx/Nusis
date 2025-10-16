import nodemailer from "nodemailer";
import fs from "fs-extra";
import Handlebars from "handlebars";
import dotenv from "dotenv";

import type { EmailTemplate, EmailTemplateDoc } from "../model/emailModel";
import {
  createEmailTemplateModel,
  listEmailTemplatesModel,
  getEmailTemplateModel,
  updateEmailTemplateModel,
  deleteEmailTemplateModel,
  findEmailTemplateByName,
} from "../model/emailModel";

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
  return listEmailTemplatesModel();
}

export async function getEmailTemplate(id: string): Promise<EmailTemplateDoc | null> {
  return getEmailTemplateModel(id);
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
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendTemplatedEmail(
  to: string | string[],
  subject: string,
  templateName: string,
  variables: Record<string, any> = {}
) {

  console.log("Testing Gmail SMTP credentials...");
  console.log("GMAIL_USER:", process.env.GMAIL_USER);
  console.log("GMAIL_PASS:", process.env.GMAIL_PASS);

  try {
    await transporter.verify();
    console.log("Gmail SMTP login successful! Credentials are valid.");
  } catch (err) {
    console.error("Gmail SMTP login failed:", err);
  }

  try {
    const templatePath = `src/email/templates/${templateName}.html`;
    const source = await fs.readFile(templatePath, "utf8");

    const compiled = Handlebars.compile(source);
    const html = compiled(variables);

    const info = await transporter.sendMail({
      from: `Test <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Sent ${templateName} email to ${to}`);
    return info;
  } catch (err) {
    console.error(`Failed to send ${templateName} email:`, err);
    throw err;
  }
}

export async function sendNusisInvitation(
  to: string | string[],
  params: {
    recipientSchool: string;
    signoffName: string;
    signoffRole: string;
    signoffOrg: string;
  }
) {
  const subject = "Invitation to NUSIS 2025 - TeamNUS Shooting";
  return sendTemplatedEmail(to, subject, "nusis-invitation-2025", params);
}

