import express from "express";
import { listExercises, generateMissing } from "./exercise.controller.js";

const router = express.Router();

router.get("/", listExercises);
router.get("/generate-missing", generateMissing);

export default router;
