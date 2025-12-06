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
	// Normalize and validate emails array
	if (!Array.isArray(data.emails) || data.emails.length === 0) {
		throw new Error("At least one email is required");
	}
	
	const normalizedEmails = data.emails.map(e => e.trim().toLowerCase());
	
	// Check for duplicates within the provided emails
	const uniqueEmails = [...new Set(normalizedEmails)];
	if (uniqueEmails.length !== normalizedEmails.length) {
		throw new Error("Duplicate emails in the list");
	}
	
	// Check if any email already exists for another recipient
	for (const email of uniqueEmails) {
		const existing = await findRecipientByEmail(email);
		if (existing) {
			const err: any = new Error(`Email ${email} already exists for recipient: ${existing.name}`);
			err.code = "DUPLICATE_EMAIL";
			throw err;
		}
	}
	
	return createRecipientModel({ ...data, emails: uniqueEmails });
}

export async function listRecipients(): Promise<RecipientDoc[]> {
	return listRecipientsModel();
}

export async function getRecipient(id: string): Promise<RecipientDoc | null> {
	return getRecipientModel(id);
}

export async function updateRecipient(id: string, data: Partial<Recipient>): Promise<RecipientDoc | null> {
	const update: Partial<Recipient> = { ...data };
	
	if (data.emails !== undefined) {
		if (!Array.isArray(data.emails) || data.emails.length === 0) {
			throw new Error("At least one email is required");
		}
		
		const normalizedEmails = data.emails.map(e => e.trim().toLowerCase());
		const uniqueEmails = [...new Set(normalizedEmails)];
		
		if (uniqueEmails.length !== normalizedEmails.length) {
			throw new Error("Duplicate emails in the list");
		}
		
		// Check if any email exists for another recipient
		for (const email of uniqueEmails) {
			const existing = await findRecipientByEmail(email);
			if (existing && existing._id.toString() !== id) {
				const err: any = new Error(`Email ${email} already exists for recipient: ${existing.name}`);
				err.code = "DUPLICATE_EMAIL";
				throw err;
			}
		}
		
		update.emails = uniqueEmails;
	}
	
	return updateRecipientModel(id, update);
}

export async function deleteRecipient(id: string): Promise<boolean> {
	return deleteRecipientModel(id);
}

