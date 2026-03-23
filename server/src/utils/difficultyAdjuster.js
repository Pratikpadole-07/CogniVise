export const getPersonalizedDifficulty = (
  baseDifficulty,
  stats
) => {
  if (!stats) return baseDifficulty;

  const accuracy = stats.accuracy || 0;
  const avgTime = stats.avgTimePerProblem || 0;
  const velocity = stats.learningVelocity || 0;

  let adjustment = 1;

  // High accuracy → easier
  if (accuracy > 80) adjustment *= 0.8;

  // Low accuracy → harder
  if (accuracy < 50) adjustment *= 1.2;

  // Fast solving → easier
  if (avgTime < 5) adjustment *= 0.85;

  // Slow solving → harder
  if (avgTime > 15) adjustment *= 1.2;

  // High velocity → easier
  if (velocity > 2) adjustment *= 0.8;

  // Low velocity → harder
  if (velocity < 0.5) adjustment *= 1.2;

  const personalizedDifficulty = baseDifficulty * adjustment;

  // Clamp between 1 and 10
  return Math.max(1, Math.min(10, personalizedDifficulty));
};