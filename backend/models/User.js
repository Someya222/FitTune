import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    gender: { 
      type: String, 
      enum: ["male", "female"] 
    },

    weight: { 
      type: Number, 
      min: 20,
      max: 300
    },

    height: { 
      type: Number, 
      min: 100,
      max: 250
    },

    fitnessLevel: { 
      type: String, 
      default: "beginner" 
    },

    goals: [String],

    profileCompleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);