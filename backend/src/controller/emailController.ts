import { Request, Response } from "express";
import {
	createEmailTemplate,
	deleteEmailTemplate,
	getEmailTemplate,
	listEmailTemplates,
	updateEmailTemplate,
} from "../service/emailService";

export async function emailTemplateCreateHandler(req: Request, res: Response) {
	try {
	const { name, subject, body, fromName, fromEmail } = req.body || {};
		if (!name || typeof name !== "string") {
			return res.status(400).json({ error: "name is required" });
		}
		if (!subject || typeof subject !== "string") {
			return res.status(400).json({ error: "subject is required" });
		}
		if (!body || typeof body !== "string") {
			return res.status(400).json({ error: "body is required" });
		}
		const created = await createEmailTemplate({ name, subject, body, fromName, fromEmail });
		res.status(201).json(created);
	} catch (err) {
		console.error("emailTemplateCreateHandler error:", err);
	if ((err as any)?.code === "DUPLICATE_NAME") return res.status(409).json({ error: "Template name already exists" });
	res.status(500).json({ error: "Internal server error" });
	}
}

export async function emailTemplateListHandler(_req: Request, res: Response) {
	try {
		const items = await listEmailTemplates();
		res.json(items);
	} catch (err) {
		console.error("emailTemplateListHandler error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
}

export async function emailTemplateGetHandler(req: Request, res: Response) {
	try {
		const { id } = req.params;
		const doc = await getEmailTemplate(id);
		if (!doc) return res.status(404).json({ error: "Not found" });
		res.json(doc);
	} catch (err) {
		console.error("emailTemplateGetHandler error:", err);
		res.status(400).json({ error: "Invalid id" });
	}
}

export async function emailTemplateUpdateHandler(req: Request, res: Response) {
	try {
		const { id } = req.params;
		const { name, subject, body, fromName, fromEmail } = req.body || {};
		const update: any = {};
		if (name !== undefined) {
			if (typeof name !== "string" || name.trim() === "") return res.status(400).json({ error: "invalid name" });
			update.name = name;
		}
		if (subject !== undefined) {
			if (typeof subject !== "string" || !subject) return res.status(400).json({ error: "invalid subject" });
			update.subject = subject;
		}
		if (body !== undefined) {
			if (typeof body !== "string" || !body) return res.status(400).json({ error: "invalid body" });
			update.body = body;
		}
		if (fromName !== undefined) update.fromName = fromName;
		if (fromEmail !== undefined) update.fromEmail = fromEmail;
		const updated = await updateEmailTemplate(id, update);
		if (!updated) {
        const existing = await getEmailTemplate(id);
                if (existing) return res.json(existing);
                return res.status(404).json({ error: "Not found" });
            }
        res.json(updated);
	} catch (err) {
		console.error("emailTemplateUpdateHandler error:", err);
	if ((err as any)?.code === "DUPLICATE_NAME") return res.status(409).json({ error: "Template name already exists" });
	res.status(400).json({ error: "Invalid id" });
	}
}

export async function emailTemplateDeleteHandler(req: Request, res: Response) {
	try {
		const { id } = req.params;
		const ok = await deleteEmailTemplate(id);
		if (!ok) return res.status(404).json({ error: "Not found" });
		res.status(204).send();
	} catch (err) {
		console.error("emailTemplateDeleteHandler error:", err);
		res.status(400).json({ error: "Invalid id" });
	}
}

