export const calculateVelocity = (logs) => {
  if (logs.length < 2) return 0;

  // Sort logs by date
  logs.sort((a, b) => new Date(a.date) - new Date(b.date));

  let totalTime = 0;
  let totalGain = 0;

  for (let i = 1; i < logs.length; i++) {
    const prev = logs[i - 1];
    const curr = logs[i];

    const prevAccuracy =
      prev.correct / prev.problemsAttempted;

    const currAccuracy =
      curr.correct / curr.problemsAttempted;

    const gain = (currAccuracy - prevAccuracy) * 100;

    totalGain += gain;
    totalTime += curr.timeSpentMinutes;
  }

  if (totalTime === 0) return 0;

  return totalGain / totalTime;
};