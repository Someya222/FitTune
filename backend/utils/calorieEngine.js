export const calculateCalories = (met, weight, duration) => {
  const safeMet = Number(met);
  const safeWeight = Number(weight);
  const safeDuration = Number(duration);

  if (
    isNaN(safeMet) ||
    isNaN(safeWeight) ||
    isNaN(safeDuration)
  ) {
    return 0;
  }

  const hours = safeDuration / 3600;

  const calories = safeMet * safeWeight * hours;

  return Number(calories.toFixed(2));
};