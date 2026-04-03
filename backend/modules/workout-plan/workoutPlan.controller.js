import crypto from "crypto";
import Exercise from "../../models/Exercise.js";
import SavedWorkoutPlan from "../../models/SavedWorkoutPlan.js";

// ─── MET values per category ────────────────────────────────────────
const MET_VALUES = { cardio: 8, strength: 5, yoga: 3, core: 6, flexibility: 3, warmup: 3, cooldown: 2 };

// ─── Goal scoring weights ────────────────────────────────────────────
const GOAL_WEIGHTS = {
  weight_loss:      { cardio: 5, strength: 2, yoga: 1, core: 3, flexibility: 1, warmup: 1, cooldown: 1 },
  muscle_gain:      { cardio: 1, strength: 5, yoga: 1, core: 3, flexibility: 1, warmup: 1, cooldown: 1 },
  flexibility:      { cardio: 1, strength: 1, yoga: 5, core: 2, flexibility: 5, warmup: 1, cooldown: 1 },
  general_fitness:  { cardio: 3, strength: 3, yoga: 2, core: 3, flexibility: 2, warmup: 1, cooldown: 1 }
};

// ─── Fitness level → sets/reps config ────────────────────────────────
const LEVEL_CONFIG = {
  beginner:     { sets: 2, reps: 10, durationSec: 20 },
  intermediate: { sets: 3, reps: 12, durationSec: 30 },
  advanced:     { sets: 4, reps: 15, durationSec: 45 }
};

// ─── Goal → rest durations (seconds) ────────────────────────────────
const REST_CONFIG = {
  weight_loss:     { min: 10, max: 15 },
  muscle_gain:     { min: 30, max: 60 },
  flexibility:     { min: 15, max: 15 },
  general_fitness: { min: 20, max: 20 }
};

// ─── Exercise count per duration bracket ─────────────────────────────
const EXERCISE_COUNT = {
  15: { min: 6,  max: 8 },
  30: { min: 8,  max: 12 },
  45: { min: 12, max: 15 },
  60: { min: 15, max: 18 }
};

// ─── Body part → targetArea mapping ──────────────────────────────────
const TARGET_AREA_MAP = {
  full_body:  null,  // no filter
  upper_body: ["chest", "back", "shoulders", "arms", "full_body"],
  lower_body: ["legs", "full_body"],
  core:       ["core", "full_body"]
};

// ─── Helpers ─────────────────────────────────────────────────────────

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getClosestBracket(duration) {
  const brackets = [15, 30, 45, 60];
  let closest = 30;
  let minDiff = Infinity;
  for (const b of brackets) {
    const diff = Math.abs(b - duration);
    if (diff < minDiff) { minDiff = diff; closest = b; }
  }
  return closest;
}

function noConsecutiveSameMuscle(selected) {
  for (let i = 1; i < selected.length; i++) {
    const prevMuscles = selected[i - 1].targetMuscles?.[0] || selected[i - 1].bodyPart;
    const currMuscles = selected[i].targetMuscles?.[0] || selected[i].bodyPart;
    if (prevMuscles && currMuscles && prevMuscles === currMuscles) {
      return false;
    }
  }
  return true;
}

// ─── POST /api/workout/generate ──────────────────────────────────────

export const generateWorkoutPlan = async (req, res) => {
  try {
    const {
      goal = "general_fitness",
      fitnessLevel = "beginner",
      duration = 30,
      equipment = "none",
      targetArea = "full_body"
    } = req.body;

    // 1. Find warmup exercise
    const warmups = await Exercise.find({
      category: { $in: ["warmup", "cardio", "flexibility"] },
      equipment: { $in: [equipment, "none", "mat"] }
    }).limit(20);

    // 2. Find cooldown exercise
    const cooldowns = await Exercise.find({
      category: { $in: ["cooldown", "yoga", "flexibility"] },
      equipment: { $in: [equipment, "none", "mat"] }
    }).limit(20);

    // 3. Build body part filter
    const bodyPartFilter = TARGET_AREA_MAP[targetArea];
    const mainFilter = {
      category: { $nin: ["warmup", "cooldown"] },
      equipment: { $in: [equipment, "none"] }
    };
    if (bodyPartFilter) {
      mainFilter.bodyPart = { $in: bodyPartFilter };
    }

    const mainExercises = await Exercise.find(mainFilter).limit(500);

    // 4. Score exercises by goal alignment
    const goalWeights = GOAL_WEIGHTS[goal] || GOAL_WEIGHTS.general_fitness;
    const scored = mainExercises.map(ex => ({
      ...ex.toObject(),
      score: (goalWeights[ex.category] || 1) + Math.random() * 2  // add randomness
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // 5. Determine exercise count
    const bracket = getClosestBracket(duration);
    const countRange = EXERCISE_COUNT[bracket];
    const targetCount = Math.min(
      countRange.min + Math.floor(Math.random() * (countRange.max - countRange.min + 1)),
      scored.length
    );

    // 6. Select exercises ensuring no consecutive same muscle group
    let selected = [];
    const used = new Set();

    for (const ex of scored) {
      if (selected.length >= targetCount) break;

      const muscle = ex.targetMuscles?.[0] || ex.bodyPart;
      const lastMuscle = selected.length > 0
        ? (selected[selected.length - 1].targetMuscles?.[0] || selected[selected.length - 1].bodyPart)
        : null;

      if (muscle !== lastMuscle || selected.length === 0) {
        if (!used.has(ex._id.toString())) {
          selected.push(ex);
          used.add(ex._id.toString());
        }
      }
    }

    // If we didn't get enough, fill with remaining (relaxing the muscle constraint)
    if (selected.length < countRange.min) {
      for (const ex of shuffleArray(scored)) {
        if (selected.length >= countRange.min) break;
        if (!used.has(ex._id.toString())) {
          selected.push(ex);
          used.add(ex._id.toString());
        }
      }
    }

    // 7. Build the plan
    const levelConfig = LEVEL_CONFIG[fitnessLevel] || LEVEL_CONFIG.beginner;
    const restConfig = REST_CONFIG[goal] || REST_CONFIG.general_fitness;
    const restDuration = Math.floor((restConfig.min + restConfig.max) / 2);

    const warmup = warmups.length > 0
      ? warmups[Math.floor(Math.random() * warmups.length)]
      : null;
    const cooldown = cooldowns.length > 0
      ? cooldowns[Math.floor(Math.random() * cooldowns.length)]
      : null;

    const planExercises = [];
    let order = 1;

    // Warmup
    if (warmup) {
      planExercises.push({
        order: order++,
        exerciseId: warmup._id.toString(),
        name: warmup.name,
        category: warmup.category,
        gifUrl: warmup.gifUrl || null,
        lottieCategory: warmup.lottieCategory || "stretching",
        sets: 1,
        reps: 0,
        duration: 150, // 2.5 min
        restAfter: 10,
        instructions: warmup.instructions || [],
        targetMuscles: warmup.targetMuscles || [],
        isWarmup: true,
        isCooldown: false
      });
    }

    // Main exercises
    for (const ex of selected) {
      const isTimeBased = ex.category === "yoga" || ex.category === "flexibility" || ex.category === "core";
      planExercises.push({
        order: order++,
        exerciseId: ex._id.toString(),
        name: ex.name,
        category: ex.category,
        gifUrl: ex.gifUrl || null,
        lottieCategory: ex.lottieCategory || mapLottieCategory(ex.category),
        sets: levelConfig.sets,
        reps: isTimeBased ? 0 : levelConfig.reps,
        duration: isTimeBased ? levelConfig.durationSec : 0,
        restAfter: restDuration,
        instructions: ex.instructions || [],
        targetMuscles: ex.targetMuscles || [],
        isWarmup: false,
        isCooldown: false
      });
    }

    // Cooldown
    if (cooldown) {
      planExercises.push({
        order: order++,
        exerciseId: cooldown._id.toString(),
        name: cooldown.name,
        category: cooldown.category,
        gifUrl: cooldown.gifUrl || null,
        lottieCategory: cooldown.lottieCategory || "stretching",
        sets: 1,
        reps: 0,
        duration: 120, // 2 min
        restAfter: 0,
        instructions: cooldown.instructions || [],
        targetMuscles: cooldown.targetMuscles || [],
        isWarmup: false,
        isCooldown: true
      });
    }

    // 8. Calculate estimated calories
    const weightKg = 65;
    const totalDurationHours = duration / 60;
    let estimatedCalories = 0;
    for (const pex of planExercises) {
      const met = MET_VALUES[pex.category] || 5;
      const exDurationHours = (pex.isWarmup ? 2.5 : pex.isCooldown ? 2 : (duration - 5) / selected.length) / 60;
      estimatedCalories += met * weightKg * exDurationHours;
    }
    estimatedCalories = Math.round(estimatedCalories);

    const plan = {
      planId: crypto.randomUUID(),
      goal,
      fitnessLevel,
      estimatedDuration: duration,
      estimatedCalories,
      exercises: planExercises
    };

    res.json(plan);
  } catch (error) {
    console.error("Generate workout plan error:", error);
    res.status(500).json({ message: error.message });
  }
};

function mapLottieCategory(category) {
  const map = {
    cardio: "cardio", strength: "strength", yoga: "yoga",
    flexibility: "stretching", core: "core", warmup: "stretching", cooldown: "stretching"
  };
  return map[category] || "strength";
}

// ─── POST /api/workout/save ──────────────────────────────────────────

export const saveWorkoutPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId, goal, fitnessLevel, estimatedDuration, estimatedCalories, exercises } = req.body;

    if (!planId || !exercises) {
      return res.status(400).json({ message: "planId and exercises are required" });
    }

    const plan = await SavedWorkoutPlan.create({
      userId,
      planId,
      goal,
      fitnessLevel,
      estimatedDuration,
      estimatedCalories,
      exercises
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error("Save workout plan error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Plan already saved" });
    }
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/workout/saved ──────────────────────────────────────────

export const getSavedPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    const plans = await SavedWorkoutPlan.find({ userId }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    console.error("Get saved plans error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─── DELETE /api/workout/:planId ────────────────────────────────────

export const deleteWorkoutPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId } = req.params;

    const result = await SavedWorkoutPlan.findOneAndDelete({ userId, planId });

    if (!result) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json({ message: "Plan deleted" });
  } catch (error) {
    console.error("Delete workout plan error:", error);
    res.status(500).json({ message: error.message });
  }
};
