import { Collection, ObjectId, WithId } from "mongodb";
import { getDb } from "../db/mongo";

export type EmailTemplate = {
	name: string;
	subject: string;
	body: string; // HTML or plain text
	fromName?: string;
	fromEmail?: string;
	createdAt?: Date;
	updatedAt?: Date;
};

export type EmailTemplateDoc = WithId<EmailTemplate>;

function collection(): Collection<EmailTemplate> {
	return getDb().collection<EmailTemplate>("email_templates");
}

export async function createEmailTemplateModel(data: EmailTemplate): Promise<EmailTemplateDoc> {
	const now = new Date();
	const doc = { ...data, createdAt: now, updatedAt: now };
	const res = await collection().insertOne(doc);
	return { _id: res.insertedId, ...doc };
}

export async function listEmailTemplatesModel(): Promise<EmailTemplateDoc[]> {
	return collection().find({}).sort({ createdAt: -1 }).toArray();
}

export async function getEmailTemplateModel(id: string): Promise<EmailTemplateDoc | null> {
	return collection().findOne({ _id: new ObjectId(id) });
}

export async function updateEmailTemplateModel(
	id: string,
	data: Partial<EmailTemplate>
): Promise<EmailTemplateDoc | null> {
	const result = await collection().findOneAndUpdate(
		{ _id: new ObjectId(id) },
		{ $set: { ...data, updatedAt: new Date() } },
		{ returnDocument: "after" }
	);
	return (result && (result as any).value) ? ((result as any).value as EmailTemplateDoc) : null;
}

export async function deleteEmailTemplateModel(id: string): Promise<boolean> {
	const res = await collection().deleteOne({ _id: new ObjectId(id) });
	return res.deletedCount === 1;
}

// Case-insensitive exact name match finder for uniqueness checks
function escapeRegex(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function findEmailTemplateByName(name: string): Promise<EmailTemplateDoc | null> {
	const rx = new RegExp(`^${escapeRegex(name)}$`, "i");
	return collection().findOne({ name: { $regex: rx } } as any);
}

