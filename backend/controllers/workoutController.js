import Exercise from "../models/Exercise.js";

export const generateWorkout = async (req, res) => {
  try {
    const { level, duration, equipment } = req.body;

    const exercises = await Exercise.find({
      difficulty: level,
      equipment: { $in: [equipment, "none"] }
    });

    // Shuffle exercises (to avoid repetition)
    const shuffled = exercises.sort(() => 0.5 - Math.random());

    let selected = [];
    let totalTime = 0;

    for (let ex of shuffled) {
      if (totalTime + ex.duration <= duration * 60) {
        selected.push(ex);
        totalTime += ex.duration;
      }
    }

    // ✅ SEND RESPONSE
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
