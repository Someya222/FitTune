import express from "express";
import { login, callback, search, profile } from "./spotify.controller.js";
const router = express.Router();

router.get("/login", login);
router.get("/callback", callback);
router.get("/search", search);
router.get("/me", profile);

export default router;