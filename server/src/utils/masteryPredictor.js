export const predictMasteryGain = (
  currentMastery,
  allocatedHours,
  targetMastery
) => {
  const k = 0.05;

  const maxGain = targetMastery - currentMastery;

  if (maxGain <= 0) return currentMastery;

  const growth =
    maxGain * (1 - Math.exp(-k * allocatedHours));

  return currentMastery + growth;
};