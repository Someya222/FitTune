import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  sourceId: { type: String },
  source: {
    type: String,
    enum: ["exercisedb", "yoga", "wger", "ai_generated"],
    default: "exercisedb"
  },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ["cardio", "strength", "yoga", "flexibility", "core", "warmup", "cooldown"],
    default: "strength"
  },
  bodyPart: { type: String, default: "full_body" },
  targetMuscles: { type: [String], default: [] },
  secondaryMuscles: { type: [String], default: [] },
  // Keep old `muscles` field for backward compat with existing data
  muscles: { type: [String], default: [] },
  equipment: {
    type: String,
    enum: ["none", "dumbbells", "gym", "mat", "barbell", "band", "bodyweight"],
    default: "none"
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner"
  },
  instructions: { type: [String], default: [] },
  gifUrl: { type: String, default: null },
  imageUrl: { type: String, default: null },
  lottieCategory: { type: String, default: null },
  tags: { type: [String], default: [] },
  aiGenerated: { type: Boolean, default: false },
  met: { type: Number, default: 5 },
  duration: { type: Number, default: 30 },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for fast filtering
exerciseSchema.index({ category: 1 });
exerciseSchema.index({ bodyPart: 1 });
exerciseSchema.index({ equipment: 1 });
exerciseSchema.index({ difficulty: 1 });
exerciseSchema.index({ tags: 1 });
exerciseSchema.index({ source: 1, sourceId: 1 }, { unique: true, sparse: true });

export default mongoose.model("Exercise", exerciseSchema);
