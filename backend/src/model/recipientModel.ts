import { Collection, ObjectId, WithId } from "mongodb";
import { getDb } from "../db/mongo";

export type Recipient = {
	name: string;
	email: string;
	createdAt?: Date;
	updatedAt?: Date;
};

export type RecipientDoc = WithId<Recipient>;

function collection(): Collection<Recipient> {
	return getDb().collection<Recipient>("recipients");
}

export async function createRecipient(data: Recipient): Promise<RecipientDoc> {
	const now = new Date();
	const doc = { ...data, createdAt: now, updatedAt: now };
	const res = await collection().insertOne(doc);
	return { _id: res.insertedId, ...doc };
}

export async function listRecipients(): Promise<RecipientDoc[]> {
	return collection().find({}).sort({ createdAt: -1 }).toArray();
}

export async function getRecipient(id: string): Promise<RecipientDoc | null> {
	return collection().findOne({ _id: new ObjectId(id) });
}

export async function findRecipientByEmail(email: string): Promise<RecipientDoc | null> {
	return collection().findOne({ email });
}

export async function updateRecipient(id: string, data: Partial<Recipient>): Promise<RecipientDoc | null> {
	const result = await collection().findOneAndUpdate(
		{ _id: new ObjectId(id) },
		{ $set: { ...data, updatedAt: new Date() } },
		{ returnDocument: "after" }
	);
	return (result && (result as any).value) ? ((result as any).value as RecipientDoc) : null;
}

export async function deleteRecipient(id: string): Promise<boolean> {
	const res = await collection().deleteOne({ _id: new ObjectId(id) });
	return res.deletedCount === 1;
}

