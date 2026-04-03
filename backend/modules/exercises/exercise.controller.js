import Exercise from "../../models/Exercise.js";
import { generateExerciseWithAI } from "../../services/gemini.service.js";

/**
 * GET /api/exercises
 * List & filter exercises
 * Query params: category, bodyPart, equipment, difficulty, tags, search, limit, skip
 */
export const listExercises = async (req, res) => {
  try {
    const { category, bodyPart, equipment, difficulty, tags, search, limit = 50, skip = 0 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (bodyPart) filter.bodyPart = bodyPart;
    if (equipment) filter.equipment = { $in: [equipment, "none"] };
    if (difficulty) filter.difficulty = difficulty;
    if (tags) filter.tags = { $in: tags.split(",") };
    if (search) filter.name = { $regex: search, $options: "i" };

    const exercises = await Exercise.find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ name: 1 });

    const total = await Exercise.countDocuments(filter);

    res.json({ exercises, total });
  } catch (error) {
    console.error("List exercises error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/exercises/generate-missing
 * Query params: name, category
 * Checks DB first, generates with Gemini AI if not found
 */
export const generateMissing = async (req, res) => {
  try {
    const { name, category } = req.query;

    if (!name || !category) {
      return res.status(400).json({ message: "name and category are required" });
    }

    // Check if exercise already exists
    const existing = await Exercise.findOne({
      name: { $regex: `^${name}$`, $options: "i" }
    });

    if (existing) {
      return res.json(existing);
    }

    // Generate with Gemini AI
    const generated = await generateExerciseWithAI(name, category);

    // Save to DB
    const exercise = await Exercise.create(generated);
    console.log(`🤖 AI-generated exercise: "${exercise.name}"`);

    res.json(exercise);
  } catch (error) {
    console.error("Generate missing exercise error:", error);
    res.status(500).json({ message: error.message });
  }
};
