export const analyzeRisks = (
  allocations,
  statsMap,
  targetMastery
) => {
  const alerts = [];

  for (const topic of allocations) {
    const topicId = topic.topicId.toString();

    const currentMastery =
      statsMap[topicId]?.masteryScore || 0;

    const lastPracticed =
      statsMap[topicId]?.lastPracticed;

    // Under allocation risk
    if (topic.allocatedHours < 5) {
      alerts.push({
        topicId,
        type: "LOW_ALLOCATION",
        message:
          "Allocated hours may be insufficient to achieve mastery.",
      });
    }

    // Stagnation risk
    if (
      topic.predictedMastery <
      currentMastery + 2
    ) {
      alerts.push({
        topicId,
        type: "LOW_IMPROVEMENT",
        message:
          "Practice may not significantly improve mastery.",
      });
    }

    // Inactivity risk
    if (lastPracticed) {
      const daysInactive =
        (Date.now() -
          new Date(lastPracticed)) /
        (1000 * 60 * 60 * 24);

      if (daysInactive > 7) {
        alerts.push({
          topicId,
          type: "INACTIVITY_RISK",
          message:
            "Topic has not been practiced recently.",
        });
      }
    }
  }

  return alerts;
};