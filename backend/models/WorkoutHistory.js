import mongoose from "mongoose";

const exerciseHistorySchema = new mongoose.Schema({
  exerciseId: String,
  name: String,

  met: Number,
  duration: Number, // in seconds

  sets: Number,
  reps: Number,

  caloriesBurned: Number,

  completed: {
    type: Boolean,
    default: true
  },

  skipped: {
    type: Boolean,
    default: false
  }
});

const workoutHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  exercises: [exerciseHistorySchema],   // 🔥 structured array

  totalCalories: {
    type: Number,
    default: 0
  },

  totalDuration: {
    type: Number,
    default: 0
  },

  fatigueScore: {
    type: Number,
    default: 0
  },

  intensityLevel: {
    type: String,
    enum: ["low", "moderate", "high"]
  },

  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("WorkoutHistory", workoutHistorySchema);
