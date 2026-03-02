import Topic from "../models/Topic.js";
import UserTopicStats from "../models/UserTopicStats.js";
import { topologicalSort } from "../graph/dependencyResolver.js";

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

  const totalDays = Math.ceil(
    (endDate - today) / (1000 * 60 * 60 * 24)
  );

  const totalAvailableHours = totalDays * dailyAvailableHours;

  // Fetch topics WITH prerequisites populated
  const topics = await Topic.find().populate("prerequisites");

  // Build topological order
  const sortedTopicIds = topologicalSort(topics);

  // Create topic map for quick lookup
  const topicMap = {};
  topics.forEach((topic) => {
    topicMap[topic._id.toString()] = topic;
  });

  // Fetch user mastery stats
  const stats = await UserTopicStats.find({ userId });

  const statsMap = {};
  stats.forEach((stat) => {
    statsMap[stat.topicId.toString()] = stat.masteryScore;
  });

  let topicCalculations = [];

  // Process topics in dependency order
  for (const topicId of sortedTopicIds) {
    const topic = topicMap[topicId];

    const currentMastery =
      statsMap[topic._id.toString()] || 0;

    const deficit = Math.max(
      0,
      targetMastery - currentMastery
    );

    if (deficit === 0) continue;

    // Enforce prerequisite mastery threshold
    const prereqNotMet = topic.prerequisites.some((pre) => {
      const preMastery =
        statsMap[pre._id.toString()] || 0;
      return preMastery < targetMastery * 0.6;
    });

    if (prereqNotMet) continue;

    const efficiency =
      (deficit * topic.importanceWeight) /
      topic.estimatedHoursToMaster;

    topicCalculations.push({
      topicId: topic._id,
      deficit,
      efficiency,
      estimatedHoursToMaster:
        topic.estimatedHoursToMaster,
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