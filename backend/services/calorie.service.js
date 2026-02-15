export const calculateCalories = (exercises, weight = 60) => {
  return Math.round(
    exercises.reduce((sum, ex) => {
      const hours = ex.duration / 3600;
      return sum + ex.met * weight * hours;
    }, 0)
  );
};
