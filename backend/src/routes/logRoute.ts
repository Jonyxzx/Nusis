import { Router } from "express";
import { createLogHandler, getLogHandler, listLogsHandler } from "../controller/logController";

const router = Router();

router.get("/", listLogsHandler);
router.get("/:id", getLogHandler);
router.post("/", createLogHandler);

export default router;

