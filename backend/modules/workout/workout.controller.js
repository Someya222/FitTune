import Exercise from "../../models/Exercise.js";
import WorkoutHistory from "../../models/WorkoutHistory.js";
import { buildWorkoutPlan } from "../../services/workoutEngine.service.js";
import { calculateCalories } from "../../services/calorie.service.js";

// 🔹 Generate Workout
export const generateWorkout = async (req, res) => {
  try {
    const { level, duration, equipment } = req.body;

    const exercises = await Exercise.find({
      difficulty: level,
      equipment: { $in: [equipment, "none"] }
    });

    const plan = buildWorkoutPlan(exercises, duration);

    res.json(plan);

  } catch (error) {
    res.status(500).json({
      message: "Workout generation failed",
      error: error.message
    });
  }
};

// 🔹 Save Workout
export const saveWorkout = async (req, res) => {
  try {
    const { userId, exercises, totalDuration } = req.body;

    const totalCalories = calculateCalories(exercises);

    const workout = await WorkoutHistory.create({
      userId,
      exercises,
      totalDuration,
      totalCalories,
      date: new Date()
    });

    res.status(201).json(workout);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Get Workout History
export const getWorkoutHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await WorkoutHistory
      .find({ userId })
      .sort({ date: -1 });

    res.json(history);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
