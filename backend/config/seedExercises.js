import mongoose from "mongoose";
import Exercise from "../models/Exercise.js";
import dotenv from "dotenv";

dotenv.config();

const exercises = [
  {
    name: "Jumping Jacks",
    category: "cardio",
    difficulty: "beginner",
    equipment: "none",
    muscles: ["full body"],
    duration: 30,
    met: 8
  },
  {
    name: "Squats",
    category: "strength",
    difficulty: "beginner",
    equipment: "none",
    muscles: ["legs"],
    duration: 30,
    met: 5
  },
  {
    name: "Push Ups",
    category: "strength",
    difficulty: "intermediate",
    equipment: "none",
    muscles: ["chest", "arms"],
    duration: 30,
    met: 6
  },
  {
    name: "Plank",
    category: "core",
    difficulty: "beginner",
    equipment: "none",
    muscles: ["core"],
    duration: 30,
    met: 4
  }
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Exercise.deleteMany();
  await Exercise.insertMany(exercises);
  console.log("Exercises Seeded ✅");
  process.exit();
};

seed();
