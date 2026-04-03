import mongoose from "mongoose";

const planExerciseSchema = new mongoose.Schema({
  order: Number,
  exerciseId: String,
  name: String,
  category: String,
  gifUrl: { type: String, default: null },
  lottieCategory: { type: String, default: null },
  sets: Number,
  reps: Number,
  duration: Number,
  restAfter: Number,
  instructions: [String],
  targetMuscles: [String],
  isWarmup: { type: Boolean, default: false },
  isCooldown: { type: Boolean, default: false }
}, { _id: false });

const savedWorkoutPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  planId: { type: String, required: true, unique: true },
  goal: {
    type: String,
    enum: ["weight_loss", "muscle_gain", "flexibility", "general_fitness"]
  },
  fitnessLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"]
  },
  estimatedDuration: Number,
  estimatedCalories: Number,
  exercises: [planExerciseSchema],
  createdAt: { type: Date, default: Date.now }
});

savedWorkoutPlanSchema.index({ userId: 1 });
savedWorkoutPlanSchema.index({ planId: 1 });

export default mongoose.model("SavedWorkoutPlan", savedWorkoutPlanSchema);
