import { Request, Response } from "express";
import {
	createRecipient,
	deleteRecipient,
	getRecipient,
	listRecipients,
	updateRecipient,
} from "../service/recipientService";

function isValidEmail(email: string): boolean {
	// simple email regex for basic validation
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createRecipientHandler(req: Request, res: Response) {
	try {
		const { name, emails } = req.body || {};
		if (!name || typeof name !== "string") return res.status(400).json({ error: "name is required" });
		if (!Array.isArray(emails) || emails.length === 0) {
			return res.status(400).json({ error: "at least one email is required" });
		}
		
		// Validate all emails
		for (const email of emails) {
			if (typeof email !== "string" || !isValidEmail(email)) {
				return res.status(400).json({ error: `invalid email: ${email}` });
			}
		}

		const created = await createRecipient({ name, emails });
		res.status(201).json(created);
	} catch (err) {
		console.error("createRecipientHandler error:", err);
		if ((err as any)?.code === "DUPLICATE_EMAIL") {
			return res.status(409).json({ error: (err as any).message });
		}
		res.status(500).json({ error: "Internal server error" });
	}
}

export async function listRecipientsHandler(_req: Request, res: Response) {
	try {
		const items = await listRecipients();
		res.json(items);
	} catch (err) {
		console.error("listRecipientsHandler error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
}

export async function getRecipientHandler(req: Request, res: Response) {
	try {
		const { id } = req.params;
		const doc = await getRecipient(id);
		if (!doc) return res.status(404).json({ error: "Not found" });
		res.json(doc);
	} catch (err) {
		console.error("getRecipientHandler error:", err);
		res.status(400).json({ error: "Invalid id" });
	}
}

export async function updateRecipientHandler(req: Request, res: Response) {
	try {
		const { id } = req.params;
		const { name, emails } = req.body || {};
		const update: any = {};
		if (name !== undefined) {
			if (typeof name !== "string" || !name) return res.status(400).json({ error: "invalid name" });
			update.name = name;
		}
		if (emails !== undefined) {
			if (!Array.isArray(emails) || emails.length === 0) {
				return res.status(400).json({ error: "at least one email is required" });
			}
			
			// Validate all emails
			for (const email of emails) {
				if (typeof email !== "string" || !isValidEmail(email)) {
					return res.status(400).json({ error: `invalid email: ${email}` });
				}
			}
			
			update.emails = emails;
		}
		const updated = await updateRecipient(id, update);
		if (!updated) {
			const existing = await getRecipient(id);
			if (existing) return res.json(existing);
			return res.status(404).json({ error: "Not found" });
		}
		res.json(updated);
	} catch (err) {
		console.error("updateRecipientHandler error:", err);
		if ((err as any)?.code === "DUPLICATE_EMAIL") {
			return res.status(409).json({ error: (err as any).message });
		}
		res.status(400).json({ error: "Invalid id" });
	}
}

export async function deleteRecipientHandler(req: Request, res: Response) {
	try {
		const { id } = req.params;
		const ok = await deleteRecipient(id);
		if (!ok) return res.status(404).json({ error: "Not found" });
		res.status(204).send();
	} catch (err) {
		console.error("deleteRecipientHandler error:", err);
		res.status(400).json({ error: "Invalid id" });
	}
}

