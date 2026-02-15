import express from "express";
import { generateWorkout, saveWorkout, getWorkoutHistory } from "./workout.controller.js";

const router = express.Router();

router.post("/generate", generateWorkout);
router.post("/save", saveWorkout);
router.get("/history/:userId", getWorkoutHistory);

export default router;
