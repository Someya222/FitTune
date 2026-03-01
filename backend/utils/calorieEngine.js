export const calculateCalories = (met, weight, duration) => {
  if (!met || !weight || !duration) return 0;

  const hours = duration / 3600;
  return Math.round(met * weight * hours);
};