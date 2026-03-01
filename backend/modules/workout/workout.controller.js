import Exercise from "../../models/Exercise.js";
import WorkoutHistory from "../../models/WorkoutHistory.js";
import User from "../../models/User.js";
import { calculateCalories } from "../../utils/calorieEngine.js";
import { calculateSessionFatigue } from "../../utils/fatigueEngine.js";

/* ---------------- GENERATE WORKOUT ---------------- */
export const generateWorkout = async (req, res) => {
  try {
    const { level, duration, equipment } = req.body;

    const exercises = await Exercise.find({
      difficulty: level,
      equipment: { $in: [equipment, "none"] }
    });

    if (!exercises.length) {
      return res.status(404).json({ message: "No exercises found" });
    }

    const shuffled = exercises.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 8);

    res.json({
  exercises: selected
});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- GET WORKOUT HISTORY ---------------- */
export const getWorkoutHistory = async (req, res) => {
  try {
    const history = await WorkoutHistory.find({
      userId: req.user.id
    }).sort({ date: -1 });

    res.json(history);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- COMPLETE WORKOUT (FATIGUE ENGINE) ---------------- */
const classifyIntensity = (fatigueScore) => {
  if (fatigueScore < 20) return "low";
  if (fatigueScore < 40) return "moderate";
  return "high";
};

export const completeWorkout = async (req, res) => {
  try {
    const { exercises } = req.body;

    const user = await User.findById(req.user.id);

    let totalCalories = 0;
    let totalDuration = 0;

    const enrichedExercises = exercises.map(ex => {
      const calories = calculateCalories(
        ex.met,
        user.weight,
        ex.duration
      );

      totalCalories += calories;
      totalDuration += ex.duration;

      return {
        ...ex,
        caloriesBurned: calories
      };
    });

    const fatigueScore = calculateSessionFatigue(
      enrichedExercises,
      user.fitnessLevel
    );

    const intensityLevel = classifyIntensity(fatigueScore);

    const workout = await WorkoutHistory.create({
      userId: user._id,
      exercises: enrichedExercises,
      totalCalories,
      totalDuration,
      fatigueScore,
      intensityLevel
    });

    user.totalCalories += totalCalories;
    user.totalWorkouts += 1;
    await user.save();

    res.status(201).json(workout);

  } catch (error) {
  console.error("COMPLETE WORKOUT ERROR:", error);
  res.status(500).json({ message: error.message });
}
};
