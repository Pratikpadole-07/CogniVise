export const predictMasteryGain = (
  currentMastery,
  allocatedHours,
  targetMastery,
  learningRate = 0.05
) => {
  if (allocatedHours <= 0) return currentMastery;

  const maxGain = targetMastery - currentMastery;

  if (maxGain <= 0) return currentMastery;

  // Sigmoid-like saturation (exponential decay form)
  const growth =
    maxGain * (1 - Math.exp(-learningRate * allocatedHours));

  const predicted = currentMastery + growth;

  // Clamp to target
  return Math.min(predicted, targetMastery);
};