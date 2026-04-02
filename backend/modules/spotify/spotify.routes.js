import express from "express";
import { login, callback, search, profile, refreshToken, topTracks, recommendations } from "./spotify.controller.js";
const router = express.Router();

router.get("/login", login);
router.get("/callback", callback);
router.get("/search", search);
router.get("/top-tracks", topTracks);
router.get("/recommendations", recommendations);
router.get("/me", profile);
router.post("/refresh", refreshToken);

export default router;