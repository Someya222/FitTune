import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a structured exercise JSON using Google Gemini
 * when an exercise is not found in the database.
 */
export const generateExerciseWithAI = async (name, category) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are a fitness expert. Generate a structured JSON object for an exercise with the following details.

Exercise name: "${name}"
Category: "${category}"

Return ONLY a valid JSON object (no markdown, no code fences) with exactly these fields:
{
  "name": "${name}",
  "category": "${category}",
  "bodyPart": "<string: chest|back|shoulders|legs|arms|core|full_body>",
  "targetMuscles": ["<primary muscles worked>"],
  "secondaryMuscles": ["<secondary muscles worked>"],
  "equipment": "<none|dumbbells|gym|mat|barbell|band|bodyweight>",
  "difficulty": "<beginner|intermediate|advanced>",
  "instructions": ["<step 1>", "<step 2>", "<step 3>", "..."],
  "tags": ["<relevant tags like weight_loss, muscle_gain, flexibility, endurance>"],
  "met": <number: MET value for calorie calculation, typically 3-10>,
  "duration": <number: recommended duration in seconds, typically 20-60>,
  "lottieCategory": "<strength|cardio|yoga|stretching|core>"
}

Be accurate with muscle groups and MET values. Return ONLY the JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean any markdown fences if present
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      sourceId: `ai_${Date.now()}`,
      source: "ai_generated",
      name: parsed.name || name,
      category: parsed.category || category,
      bodyPart: parsed.bodyPart || "full_body",
      targetMuscles: parsed.targetMuscles || [],
      secondaryMuscles: parsed.secondaryMuscles || [],
      equipment: parsed.equipment || "none",
      difficulty: parsed.difficulty || "beginner",
      instructions: parsed.instructions || [],
      gifUrl: null,
      imageUrl: null,
      lottieCategory: parsed.lottieCategory || category,
      tags: parsed.tags || [],
      aiGenerated: true,
      met: parsed.met || 5,
      duration: parsed.duration || 30
    };
  } catch (error) {
    console.error("Gemini AI generation error:", error);
    throw new Error("Failed to generate exercise with AI");
  }
};
