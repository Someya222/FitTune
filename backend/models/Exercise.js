import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: String,
  category: String,        // cardio, strength, flexibility
  difficulty: String,      // beginner, intermediate, advanced
  equipment: String,       // none, dumbbells, gym
  muscles: [String],
  duration: Number,        // seconds
  met: Number              // calorie calculation later
});

export default mongoose.model("Exercise", exerciseSchema);
