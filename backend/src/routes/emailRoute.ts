import { Router } from "express";
import {
	emailTemplateCreateHandler,
	emailTemplateDeleteHandler,
	emailTemplateGetHandler,
	emailTemplateListHandler,
	emailTemplateUpdateHandler,
	sendEmailCampaignHandler,
} from "../controller/emailController";

const router = Router();

router.get("/", emailTemplateListHandler);
router.post("/", emailTemplateCreateHandler);
router.post("/send", sendEmailCampaignHandler);
router.get("/:id", emailTemplateGetHandler);
router.put("/:id", emailTemplateUpdateHandler);
router.delete("/:id", emailTemplateDeleteHandler);

export default router;

