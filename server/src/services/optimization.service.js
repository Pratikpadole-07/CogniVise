import Topic from "../models/Topic.js";
import UserTopicStats from "../models/UserTopicStats.js";

export const generateOptimizedPlan = async (
  userId,
  dailyAvailableHours,
  deadline,
  targetMastery = 85
) => {
  const today = new Date();
  const endDate = new Date(deadline);

  if (endDate <= today) {
    throw new Error("Deadline must be in the future");
  }

  const totalDays =
    Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

  const totalAvailableHours = totalDays * dailyAvailableHours;

  // Fetch all topics
  const topics = await Topic.find();

  // Fetch user stats
  const stats = await UserTopicStats.find({ userId });

  const statsMap = {};
  stats.forEach((stat) => {
    statsMap[stat.topicId.toString()] = stat.masteryScore;
  });

  let topicCalculations = [];

  for (const topic of topics) {
    const currentMastery =
      statsMap[topic._id.toString()] || 0;

    const deficit = Math.max(
      0,
      targetMastery - currentMastery
    );

    if (deficit === 0) continue;

    const efficiency =
      (deficit * topic.importanceWeight) /
      topic.estimatedHoursToMaster;

    topicCalculations.push({
      topicId: topic._id,
      name: topic.name,
      deficit,
      efficiency,
      estimatedHoursToMaster: topic.estimatedHoursToMaster,
    });
  }

  // Sort by efficiency descending
  topicCalculations.sort(
    (a, b) => b.efficiency - a.efficiency
  );

  let remainingHours = totalAvailableHours;
  let allocation = [];

  for (const topic of topicCalculations) {
    if (remainingHours <= 0) break;

    const hoursToAllocate = Math.min(
      topic.estimatedHoursToMaster,
      remainingHours
    );

    allocation.push({
      topicId: topic.topicId,
      allocatedHours: hoursToAllocate,
    });

    remainingHours -= hoursToAllocate;
  }

  return {
    totalDays,
    totalAvailableHours,
    allocation,
  };
};