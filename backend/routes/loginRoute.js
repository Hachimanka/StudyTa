import express from "express";
import { login } from "../controllers/loginController.js";

const router = express.Router();

// This route file provides /login endpoint if mounted.
router.post("/login", login);

export default router;
