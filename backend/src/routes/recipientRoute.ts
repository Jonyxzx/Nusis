import { Router } from "express";
import {
	createRecipientHandler,
	deleteRecipientHandler,
	getRecipientHandler,
	listRecipientsHandler,
	updateRecipientHandler,
} from "../controller/recipientController";

const router = Router();

// CRUD routes
router.get("/", listRecipientsHandler);
router.post("/", createRecipientHandler);
router.get("/:id", getRecipientHandler);
router.put("/:id", updateRecipientHandler);
router.delete("/:id", deleteRecipientHandler);

export default router;

