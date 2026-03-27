import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 🔥 Fix for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 FORCE correct .env path
dotenv.config({ path: path.join(__dirname, ".env") });

// ✅ Debug (temporary)
console.log("ENV CHECK:", process.env.SPOTIFY_CLIENT_ID);
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./modules/auth/auth.routes.js";
import workoutRoutes from "./modules/workout/workout.routes.js";
import spotifyRoutes from "./modules/spotify/spotify.routes.js";


connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutRoutes);

app.use("/api/spotify", spotifyRoutes);

app.get("/", (req, res) => {
  res.send("FitTune Backend Running 💪");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
