export const calculateFeasibilityScore = (
  allocations,
  targetMastery
) => {
  if (!allocations.length) return 0;

  let sum = 0;

  for (const topic of allocations) {
    const completion =
      topic.predictedMastery / targetMastery;

    const normalized = Math.min(1, completion);

    sum += normalized;
  }

  return sum / allocations.length;
};