import { Request, Response } from "express";
import { getLog, listLogs, logEmailSend } from "../service/logService";

export async function createLogHandler(req: Request, res: Response) {
	try {
		const {
			templateName,
			subject,
			bodyPreview,
			recipients,
			perRecipient,
			recipientCount,
			successCount,
			failedCount,
			startedAt,
			completedAt,
			durationMs,
			meta,
		} = req.body || {};

		if (!templateName || typeof templateName !== "string") return res.status(400).json({ error: "templateName is required" });
		if (!subject || typeof subject !== "string") return res.status(400).json({ error: "subject is required" });
		if (!Array.isArray(recipients) || recipients.length === 0) return res.status(400).json({ error: "recipients array is required" });

		const now = new Date();
		const payload = {
			templateName,
			subject,
			bodyPreview,
			recipients,
			perRecipient,
			recipientCount: recipientCount ?? recipients.length,
			successCount: successCount ?? (Array.isArray(perRecipient) ? perRecipient.filter((r: any) => r.status === "sent").length : 0),
			failedCount: failedCount ?? (Array.isArray(perRecipient) ? perRecipient.filter((r: any) => r.status === "failed").length : 0),
			startedAt: startedAt ? new Date(startedAt) : now,
			completedAt: completedAt ? new Date(completedAt) : now,
			durationMs: durationMs ?? (completedAt && startedAt ? new Date(completedAt).getTime() - new Date(startedAt).getTime() : undefined),
			meta,
		};

		const created = await logEmailSend(payload);
		res.status(201).json(created);
	} catch (err) {
		console.error("createLogHandler error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
}

export async function getLogHandler(req: Request, res: Response) {
	try {
		const { id } = req.params;
		const doc = await getLog(id);
		if (!doc) return res.status(404).json({ error: "Not found" });
		res.json(doc);
	} catch (err) {
		console.error("getLogHandler error:", err);
		res.status(400).json({ error: "Invalid id" });
	}
}

export async function listLogsHandler(req: Request, res: Response) {
	try {
		const limit = req.query.limit ? Number(req.query.limit) : undefined;
		const items = await listLogs(limit);
		res.json(items);
	} catch (err) {
		console.error("listLogsHandler error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
}

