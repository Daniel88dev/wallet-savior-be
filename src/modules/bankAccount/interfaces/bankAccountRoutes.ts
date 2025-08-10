import { Router } from "express";
import { createBankAccountHandler } from "./bankAccountController.js";

const router = Router();

router.post("/", createBankAccountHandler);

export default router;
