import Exercise from "../../models/Exercise.js";
import WorkoutHistory from "../../models/WorkoutHistory.js";

// 🔹 Generate Workout
export const generateWorkout = async (req, res) => {
  try {
    const { level, duration, equipment } = req.body;

    const exercises = await Exercise.find({
      difficulty: level,
      equipment: { $in: [equipment, "none"] }
    });

    const shuffled = exercises.sort(() => 0.5 - Math.random());

    let selected = [];
    let totalTime = 0;

    for (let ex of shuffled) {
      if (totalTime + ex.duration <= duration * 60) {
        selected.push(ex);
        totalTime += ex.duration;
      }
    }

    res.json({
      totalTime,
      exercises: selected
    });

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
    const { userId, exercises, totalDuration, totalCalories } = req.body;

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
