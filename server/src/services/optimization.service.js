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

  const topics = await Topic.find().populate("prerequisites");
  const sortedTopicIds = topologicalSort(topics);

  const topicMap = {};
  topics.forEach((topic) => {
    topicMap[topic._id.toString()] = topic;
  });

  const stats = await UserTopicStats.find({ userId });

  const statsMap = {};
  stats.forEach((stat) => {
    statsMap[stat.topicId.toString()] = stat.masteryScore;
  });

  let eligibleTopics = [];

  for (const topicId of sortedTopicIds) {
    const topic = topicMap[topicId];

    const currentMastery =
      statsMap[topic._id.toString()] || 0;

    const deficit = Math.max(
      0,
      targetMastery - currentMastery
    );

    if (deficit === 0) continue;

    const prereqNotMet = topic.prerequisites.some((pre) => {
      const preMastery =
        statsMap[pre._id.toString()] || 0;
      return preMastery < targetMastery * 0.6;
    });

    if (prereqNotMet) continue;

    const efficiency =
      (deficit * topic.importanceWeight) /
      topic.estimatedHoursToMaster;

    eligibleTopics.push({
      topicId: topic._id,
      efficiency,
      maxHours: topic.estimatedHoursToMaster,
    });
  }

  if (!eligibleTopics.length) {
    return {
      totalDays,
      totalAvailableHours,
      allocation: [],
    };
  }

  const totalEfficiency = eligibleTopics.reduce(
    (sum, t) => sum + t.efficiency,
    0
  );

  let allocation = [];

  let remainingHours = totalAvailableHours;

  // Proportional allocation
  for (const topic of eligibleTopics) {
    let allocated =
      (totalAvailableHours * topic.efficiency) /
      totalEfficiency;

    allocated = Math.min(allocated, topic.maxHours);

    allocation.push({
      topicId: topic.topicId,
      allocatedHours: Math.floor(allocated),
    });

    remainingHours -= Math.floor(allocated);
  }

  // Redistribute leftover hours greedily
  allocation.sort((a, b) => {
    const topicA = eligibleTopics.find(
      (t) => t.topicId.toString() === a.topicId.toString()
    );
    const topicB = eligibleTopics.find(
      (t) => t.topicId.toString() === b.topicId.toString()
    );
    return topicB.efficiency - topicA.efficiency;
  });

  for (const topic of allocation) {
    if (remainingHours <= 0) break;

    topic.allocatedHours += 1;
    remainingHours -= 1;
  }

  return {
    totalDays,
    totalAvailableHours,
    allocation,
  };
};