export const applyDecay = (masteryScore, lastPracticed) => {
  if (!lastPracticed) return masteryScore;

  const now = new Date();
  const diffDays = Math.floor(
    (now - new Date(lastPracticed)) / (1000 * 60 * 60 * 24)
  );

  const decayRatePerDay = 0.2; 
  const decayAmount = diffDays * decayRatePerDay;

  const newScore = masteryScore - decayAmount;

  return newScore < 0 ? 0 : newScore;
};