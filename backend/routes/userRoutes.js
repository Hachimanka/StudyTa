
import mongoose from "mongoose";
import express from "express";
import Users from "../models/Users.js";
import { login } from "../controllers/loginController.js";
import { register, verify } from "../controllers/registerController.js";
import { requestReset, reset } from "../controllers/forgotPasswordController.js";

const router = express.Router();

// Get user info by userId
router.get("/userinfo/:userId", async (req, res) => {
  try {
    const UserInfo = (await import("../models/UserInfo.js")).default;
    const info = await UserInfo.findOne({ userId: req.params.userId });
    if (!info) return res.status(404).json({ message: "User info not found" });
    res.json(info);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user info" });
  }
});

// Login route (delegated to controller)
router.post("/login", login);

// Forgot password endpoints delegated to controller
router.post("/forgot-password", requestReset);
router.post("/reset-password", reset);

// Registration + verification delegated to controller
router.post("/register", register);
router.get("/verify-email", verify);

router.get("/users", async (req, res) => {
  try {
    const users = await Users.find().select("-password"); // Exclude passwords 
    res.status(200).json(users);  
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
