export const calculateVelocity = (logs) => {
  if (logs.length < 2) return 0;

  const recentLogs = logs.slice(-6); // use last 6 logs

  let gains = [];
  let times = [];

  for (let i = 1; i < recentLogs.length; i++) {
    const prev = recentLogs[i - 1];
    const curr = recentLogs[i];

    const prevAcc =
      prev.correct / prev.problemsAttempted;

    const currAcc =
      curr.correct / curr.problemsAttempted;

    const gain = (currAcc - prevAcc) * 100;

    gains.push(gain);
    times.push(curr.timeSpentMinutes);
  }

  const totalGain = gains.reduce((a, b) => a + b, 0);
  const totalTime = times.reduce((a, b) => a + b, 0);

  if (totalTime === 0) return 0;

  return totalGain / totalTime;
};