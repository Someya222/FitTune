/**
 * One-time data ingestion script.
 * Populates MongoDB with exercises from ExerciseDB, Yoga API, and wger.
 * Safe to run multiple times (uses upsert).
 *
 * Usage: node scripts/ingestExercises.js
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import Exercise from "../models/Exercise.js";

// ─── Mapping helpers ───────────────────────────────────────────────

const mapBodyPart = (bp) => {
  const map = {
    back: "back", chest: "chest", "upper arms": "arms", "lower arms": "arms",
    "upper legs": "legs", "lower legs": "legs", shoulders: "shoulders",
    waist: "core", cardio: "full_body", neck: "shoulders"
  };
  return map[bp?.toLowerCase()] || "full_body";
};

const mapCategory = (cat) => {
  const map = {
    back: "strength", chest: "strength", shoulders: "strength",
    "upper arms": "strength", "lower arms": "strength",
    "upper legs": "strength", "lower legs": "strength",
    waist: "core", cardio: "cardio", neck: "strength"
  };
  return map[cat?.toLowerCase()] || "strength";
};

const mapEquipment = (eq) => {
  if (!eq || eq === "body weight") return "none";
  if (eq.includes("dumbbell")) return "dumbbells";
  if (eq.includes("barbell")) return "barbell";
  if (eq.includes("band") || eq.includes("rope")) return "band";
  if (eq.includes("mat") || eq.includes("foam") || eq.includes("ball")) return "mat";
  return "gym";
};

const mapDifficulty = (source, exercise) => {
  // ExerciseDB doesn't have difficulty — infer from equipment
  if (source === "exercisedb") {
    if (exercise.equipment === "body weight") return "beginner";
    if (exercise.equipment === "dumbbell") return "intermediate";
    return "advanced";
  }
  return "beginner";
};

const mapMET = (category) => {
  const metMap = { cardio: 8, strength: 5, yoga: 3, core: 6, flexibility: 3, warmup: 3, cooldown: 2 };
  return metMap[category] || 5;
};

const mapTags = (category, bodyPart) => {
  const tags = [];
  if (category === "cardio") tags.push("weight_loss", "endurance");
  if (category === "strength") tags.push("muscle_gain");
  if (category === "yoga" || category === "flexibility") tags.push("flexibility", "recovery");
  if (category === "core") tags.push("core_strength", "muscle_gain");
  return tags;
};

const mapLottieCategory = (category) => {
  const map = {
    cardio: "cardio", strength: "strength", yoga: "yoga",
    flexibility: "stretching", core: "core", warmup: "stretching", cooldown: "stretching"
  };
  return map[category] || "strength";
};

// ─── Source 1: ExerciseDB (RapidAPI) ───────────────────────────────

async function fetchExerciseDB() {
  const key = process.env.RAPIDAPI_KEY;
  if (!key || key === "your_key_here") {
    console.log("⚠️  RAPIDAPI_KEY not set — skipping ExerciseDB");
    return [];
  }

  console.log("📦 Fetching from ExerciseDB...");
  const exercises = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    try {
      const { data } = await axios.get(
        `https://exercisedb.p.rapidapi.com/exercises?limit=${limit}&offset=${offset}`,
        {
          headers: {
            "X-RapidAPI-Key": key,
            "X-RapidAPI-Host": "exercisedb.p.rapidapi.com"
          }
        }
      );

      if (!data || data.length === 0) break;

      for (const ex of data) {
        const cat = mapCategory(ex.bodyPart);
        exercises.push({
          sourceId: String(ex.id),
          source: "exercisedb",
          name: ex.name,
          category: cat,
          bodyPart: mapBodyPart(ex.bodyPart),
          targetMuscles: [ex.target].filter(Boolean),
          secondaryMuscles: ex.secondaryMuscles || [],
          equipment: mapEquipment(ex.equipment),
          difficulty: mapDifficulty("exercisedb", ex),
          instructions: ex.instructions || [],
          gifUrl: ex.gifUrl || null,
          imageUrl: null,
          lottieCategory: mapLottieCategory(cat),
          tags: mapTags(cat, ex.bodyPart),
          aiGenerated: false,
          met: mapMET(cat),
          duration: 30
        });
      }

      offset += limit;
      console.log(`   → Fetched ${exercises.length} exercises so far...`);

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`   ExerciseDB fetch error at offset ${offset}:`, err.message);
      break;
    }
  }

  console.log(`✅ ExerciseDB: ${exercises.length} exercises`);
  return exercises;
}

// ─── Source 2: Yoga API ────────────────────────────────────────────

async function fetchYogaAPI() {
  console.log("🧘 Fetching from Yoga API...");
  const exercises = [];

  try {
    const { data: poses } = await axios.get(
      "https://yoga-api-nzy4.onrender.com/v1/poses",
      { timeout: 15000 }
    );

    if (Array.isArray(poses)) {
      for (const pose of poses) {
        exercises.push({
          sourceId: String(pose.id),
          source: "yoga",
          name: pose.english_name || pose.sanskrit_name || "Yoga Pose",
          category: "yoga",
          bodyPart: "full_body",
          targetMuscles: [],
          secondaryMuscles: [],
          equipment: "mat",
          difficulty: "beginner",
          instructions: pose.pose_description
            ? [pose.pose_description]
            : [],
          gifUrl: null,
          imageUrl: pose.url_png || pose.url_svg || null,
          lottieCategory: "yoga",
          tags: ["flexibility", "recovery", "mindfulness"],
          aiGenerated: false,
          met: 3,
          duration: 30
        });
      }
    }
  } catch (err) {
    console.error("   Yoga API error:", err.message);
  }

  console.log(`✅ Yoga API: ${exercises.length} poses`);
  return exercises;
}

// ─── Source 3: wger REST API ───────────────────────────────────────

async function fetchWger() {
  console.log("💪 Fetching from wger API...");
  const exercises = [];

  // Fetch category mapping first
  const categoryMap = {};
  try {
    const { data: catData } = await axios.get(
      "https://wger.de/api/v2/exercisecategory/?format=json",
      { timeout: 15000 }
    );
    for (const cat of catData.results || []) {
      categoryMap[cat.id] = cat.name?.toLowerCase() || "strength";
    }
  } catch (err) {
    console.error("   wger category fetch error:", err.message);
  }

  // Fetch equipment mapping
  const equipmentMap = {};
  try {
    const { data: eqData } = await axios.get(
      "https://wger.de/api/v2/equipment/?format=json",
      { timeout: 15000 }
    );
    for (const eq of eqData.results || []) {
      equipmentMap[eq.id] = eq.name?.toLowerCase() || "none";
    }
  } catch (err) {
    console.error("   wger equipment fetch error:", err.message);
  }

  // Fetch exercises (paginated)
  let url = "https://wger.de/api/v2/exercise/?language=2&format=json&limit=100";

  while (url) {
    try {
      const { data } = await axios.get(url, { timeout: 15000 });

      for (const ex of data.results || []) {
        // Skip exercises without a name
        if (!ex.name || ex.name.trim() === "") continue;

        const wgerCat = categoryMap[ex.category] || "strength";
        let cat = "strength";
        if (wgerCat.includes("cardio") || wgerCat.includes("running")) cat = "cardio";
        else if (wgerCat.includes("abs")) cat = "core";
        else if (wgerCat.includes("stretch")) cat = "flexibility";
        else if (wgerCat.includes("yoga")) cat = "yoga";

        const bodyPartMap = {
          abs: "core", arms: "arms", back: "back", calves: "legs",
          chest: "chest", legs: "legs", shoulders: "shoulders"
        };
        const bp = bodyPartMap[wgerCat] || "full_body";

        // Equipment from first equipment ID
        let equip = "none";
        if (ex.equipment && ex.equipment.length > 0) {
          const eqName = equipmentMap[ex.equipment[0]] || "";
          equip = mapEquipment(eqName);
        }

        // Strip HTML from description
        const desc = (ex.description || "")
          .replace(/<[^>]*>/g, "")
          .trim();

        exercises.push({
          sourceId: String(ex.id),
          source: "wger",
          name: ex.name,
          category: cat,
          bodyPart: bp,
          targetMuscles: (ex.muscles || []).map(m => String(m)),
          secondaryMuscles: (ex.muscles_secondary || []).map(m => String(m)),
          equipment: equip,
          difficulty: "beginner",
          instructions: desc ? [desc] : [],
          gifUrl: null,
          imageUrl: null,
          lottieCategory: mapLottieCategory(cat),
          tags: mapTags(cat, bp),
          aiGenerated: false,
          met: mapMET(cat),
          duration: 30
        });
      }

      url = data.next;
      console.log(`   → Fetched ${exercises.length} exercises so far...`);
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error("   wger fetch error:", err.message);
      break;
    }
  }

  console.log(`✅ wger API: ${exercises.length} exercises`);
  return exercises;
}

// ─── Main ingestion ───────────────────────────────────────────────

async function ingest() {
  console.log("\n🚀 Starting exercise data ingestion...\n");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected ✅\n");

  // Fetch from all sources in parallel
  const [exerciseDBData, yogaData, wgerData] = await Promise.all([
    fetchExerciseDB(),
    fetchYogaAPI(),
    fetchWger()
  ]);

  const allExercises = [...exerciseDBData, ...yogaData, ...wgerData];
  console.log(`\n📊 Total exercises fetched: ${allExercises.length}`);

  // Upsert all exercises
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const ex of allExercises) {
    try {
      const result = await Exercise.updateOne(
        { source: ex.source, sourceId: ex.sourceId },
        { $set: ex },
        { upsert: true }
      );

      if (result.upsertedCount > 0) inserted++;
      else if (result.modifiedCount > 0) updated++;
    } catch (err) {
      errors++;
      if (errors <= 5) {
        console.error(`   Upsert error for "${ex.name}":`, err.message);
      }
    }
  }

  console.log(`\n✅ Ingestion complete!`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Updated:  ${updated}`);
  console.log(`   Errors:   ${errors}`);
  console.log(`   Total in DB: ${await Exercise.countDocuments()}`);

  await mongoose.disconnect();
  console.log("\nMongoDB Disconnected. Done! 🎉\n");
  process.exit(0);
}

ingest().catch((err) => {
  console.error("Fatal ingestion error:", err);
  process.exit(1);
});
