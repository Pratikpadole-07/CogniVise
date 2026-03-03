import solver from "javascript-lp-solver";
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

  let model = {
    optimize: "score",
    opType: "max",
    constraints: {
      totalHours: { max: totalAvailableHours },
    },
    variables: {},
  };

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

    const variableName = `x_${topic._id.toString()}`;

    model.variables[variableName] = {
      score: efficiency,
      totalHours: 1,
    };

    model.constraints[variableName] = {
      max: topic.estimatedHoursToMaster,
    };

    model.variables[variableName][variableName] = 1;
  }

  const results = solver.Solve(model);

  let allocation = [];

  Object.keys(results).forEach((key) => {
    if (key.startsWith("x_") && results[key] > 0) {
      allocation.push({
        topicId: key.replace("x_", ""),
        allocatedHours: Math.floor(results[key]),
      });
    }
  });

  return {
    totalDays,
    totalAvailableHours,
    allocation,
  };
};