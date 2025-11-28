import express from "express";
import { requestReset, reset } from "../controllers/forgotPasswordController.js";

const router = express.Router();

router.post("/forgot-password", requestReset);
router.post("/reset-password", reset);

export default router;
