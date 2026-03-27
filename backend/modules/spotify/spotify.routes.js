import express from "express";
import { login, callback, search, profile, refreshToken } from "./spotify.controller.js";
const router = express.Router();

router.get("/login", login);
router.get("/callback", callback);
router.get("/search", search);
router.get("/me", profile);
router.post("/refresh", refreshToken);

export default router;