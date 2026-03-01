import express from "express";
import {
  generateWorkout,
  getWorkoutHistory,
  completeWorkout
} from "./workout.controller.js";

import { protect } from "../auth/auth.middleware.js";

const router = express.Router();

router.post("/generate", protect, generateWorkout);
router.get("/history", protect, getWorkoutHistory);
router.post("/complete", protect, completeWorkout);

export default router;
