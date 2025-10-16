import type { Recipient, RecipientDoc } from "../model/recipientModel";
import {
	createRecipient as createRecipientModel,
	listRecipients as listRecipientsModel,
	getRecipient as getRecipientModel,
	updateRecipient as updateRecipientModel,
	deleteRecipient as deleteRecipientModel,
	findRecipientByEmail,
} from "../model/recipientModel";

export async function createRecipient(data: Recipient): Promise<RecipientDoc> {
	// Normalize and dedupe by email
	const email = data.email.trim().toLowerCase();
	const existing = await findRecipientByEmail(email);
	if (existing) {
		const err: any = new Error("Recipient with this email already exists");
		err.code = "DUPLICATE_EMAIL";
		throw err;
	}
	return createRecipientModel({ ...data, email });
}

export async function listRecipients(): Promise<RecipientDoc[]> {
	return listRecipientsModel();
}

export async function getRecipient(id: string): Promise<RecipientDoc | null> {
	return getRecipientModel(id);
}

export async function updateRecipient(id: string, data: Partial<Recipient>): Promise<RecipientDoc | null> {
	const update: Partial<Recipient> = { ...data };
	if (data.email !== undefined) {
		const email = data.email.trim().toLowerCase();
		const existing = await findRecipientByEmail(email);
		if (existing && existing._id.toString() !== id) {
			const err: any = new Error("Recipient with this email already exists");
			err.code = "DUPLICATE_EMAIL";
			throw err;
		}
		update.email = email;
	}
	return updateRecipientModel(id, update);
}

export async function deleteRecipient(id: string): Promise<boolean> {
	return deleteRecipientModel(id);
}

