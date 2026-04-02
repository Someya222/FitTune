import express from "express";
import { registerUser, loginUser, updateProfile, getProfile } from "./auth.controller.js";
import { protect } from "./auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;