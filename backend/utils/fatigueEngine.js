export const calculateExerciseLoad = (met, durationSeconds) => {
  const durationMinutes = durationSeconds / 60;
  return met * durationMinutes;
};

export const calculateSessionFatigue = (exercises, fitnessLevel) => {
  let totalLoad = 0;

  exercises.forEach(ex => {
    totalLoad += calculateExerciseLoad(ex.met, ex.duration);
  });

  const recoveryMap = {
    beginner: 0.8,
    intermediate: 1.0,
    advanced: 1.2
  };

  const recoveryFactor = recoveryMap[fitnessLevel] || 1.0;

  return totalLoad / recoveryFactor;
};
