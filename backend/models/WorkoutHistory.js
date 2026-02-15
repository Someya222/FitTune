import mongoose from "mongoose";

const workoutHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  exercises: Array,
  totalCalories: Number,
  totalDuration: Number,
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("WorkoutHistory", workoutHistorySchema);
