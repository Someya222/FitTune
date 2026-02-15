export const buildWorkoutPlan = (exercises, duration) => {
  const shuffled = exercises.sort(() => 0.5 - Math.random());

  let selected = [];
  let totalTime = 0;

  for (let ex of shuffled) {
    if (totalTime + ex.duration <= duration * 60) {
      selected.push(ex);
      totalTime += ex.duration;
    }
  }

  return {
    exercises: selected,
    totalTime
  };
};
