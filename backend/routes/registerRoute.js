import express from "express";
import { register, verify } from "../controllers/registerController.js";

const router = express.Router();

router.post("/register", register);
router.get("/verify-email", verify);

export default router;
