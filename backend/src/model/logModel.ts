import { Collection, ObjectId, WithId } from "mongodb";
import { getDb } from "../db/mongo";

export type RecipientStatus = {
	email: string;
	name?: string;
	status: "queued" | "sent" | "failed";
	error?: string;
	messageId?: string;
	sentAt?: Date;
};

export type EmailLog = {
	templateName: string;
	subject: string;
	bodyPreview?: string; // first N chars to avoid storing full body
	recipients: { name?: string; email: string }[];
	perRecipient?: RecipientStatus[]; // optional detailed statuses
	recipientCount: number;
	successCount: number;
	failedCount: number;
	startedAt: Date;
	completedAt?: Date;
	durationMs?: number;
	meta?: Record<string, any>;
	createdAt?: Date;
	updatedAt?: Date;
};

export type EmailLogDoc = WithId<EmailLog>;

function collection(): Collection<EmailLog> {
	return getDb().collection<EmailLog>("email_logs");
}

export async function createEmailLog(data: EmailLog): Promise<EmailLogDoc> {
	const now = new Date();
	const doc: EmailLog = {
		...data,
		recipientCount: data.recipients?.length || 0,
		successCount: data.successCount ?? 0,
		failedCount: data.failedCount ?? 0,
		createdAt: now,
		updatedAt: now,
	};
	const res = await collection().insertOne(doc);
	return { _id: res.insertedId, ...doc };
}

export async function getEmailLog(id: string): Promise<EmailLogDoc | null> {
	return collection().findOne({ _id: new ObjectId(id) });
}

export async function listEmailLogs(limit = 50): Promise<EmailLogDoc[]> {
	return collection().find({}).sort({ createdAt: -1 }).limit(limit).toArray();
}

