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
    },

    musicPreferences: {
      genres: [String],
      languages: [String],
      energyPreference: { 
        type: String, 
        enum: ["Light", "Medium", "High", "Beast Mode"],
        default: "Medium"
      },
      vocalPreference: {
        type: String,
        enum: ["With vocals", "Instrumental", "Both"],
        default: "Both"
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);