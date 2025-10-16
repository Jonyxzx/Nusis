import type { EmailLog, EmailLogDoc } from "../model/logModel";
import { createEmailLog, getEmailLog, listEmailLogs } from "../model/logModel";

export async function logEmailSend(data: EmailLog): Promise<EmailLogDoc> {
	return createEmailLog(data);
}

export async function getLog(id: string): Promise<EmailLogDoc | null> {
	return getEmailLog(id);
}

export async function listLogs(limit?: number): Promise<EmailLogDoc[]> {
	return listEmailLogs(limit);
}

