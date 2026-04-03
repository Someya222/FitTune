import express from "express";
import {
  generateWorkoutPlan,
  saveWorkoutPlan,
  getSavedPlans,
  deleteWorkoutPlan
} from "./workoutPlan.controller.js";
import { protect } from "../auth/auth.middleware.js";

const router = express.Router();

router.post("/generate", protect, generateWorkoutPlan);
router.post("/save", protect, saveWorkoutPlan);
router.get("/saved", protect, getSavedPlans);
router.delete("/:planId", protect, deleteWorkoutPlan);

export default router;
