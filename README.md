# FitTune — Exercise Data Setup

Follow these steps to set up the exercise database for the AI Workout Plan Generator.

## Prerequisites

1.  **MongoDB**: Ensure your `MONGO_URI` is correctly configured in `backend/.env`.
2.  **API Keys**: Ideally, provide these in `backend/.env` for maximum data quality:
    -   `RAPIDAPI_KEY`: Get from [RapidAPI ExerciseDB](https://rapidapi.com/justin-s-justin-s-default/api/exercisedb).
    -   `GEMINI_API_KEY`: Get from [Google AI Studio](https://aistudio.google.com/).

## One-Time Data Ingestion

Run the following command to populate your database with exercises from three sources (ExerciseDB, Yoga API, and wger). 

The script is **idempotent**, meaning you can run it multiple times to sync new data without creating duplicates.

```bash
cd backend
node scripts/ingestExercises.js
```

### What it does:
-   **ExerciseDB**: Fetches 1,300+ exercises with GIF demonstrations.
-   **Yoga API**: Fetches common yoga poses with instructions.
-   **wger**: Fetches open-source strength and cardio exercises.
-   **Mapping**: Normalizes all data into a unified schema for the AI generator.
-   **Indexing**: Automatically creates indexes on `category`, `bodyPart`, and `equipment` for high-performance generation.

## AI Fallback Generation

If a specific exercise is requested but not found in the database, the system will automatically call the **Google Gemini API** to generate a high-quality, structured exercise JSON that matches the database schema, ensuring you never run out of options.
