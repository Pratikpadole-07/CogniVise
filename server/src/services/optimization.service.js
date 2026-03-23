import solver from "javascript-lp-solver";
import Topic from "../models/Topic.js";
import UserTopicStats from "../models/UserTopicStats.js";
import { topologicalSort } from "../graph/dependencyResolver.js";
import { predictMasteryGain } from "../utils/masteryPredictor.js";
import { calculateFeasibilityScore } from "../utils/feasibilityCalculator.js";
import { analyzeRisks } from "../utils/riskAnalyzer.js";
import { getPersonalizedDifficulty } from "../utils/difficultyAdjuster.js";
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
    statsMap[stat.topicId.toString()] = stat;
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

  const stat = statsMap[topic._id.toString()];

  const currentMastery = stat?.masteryScore || 0;

  const deficit = Math.max(
    0,
    targetMastery - currentMastery
  );

  if (deficit === 0) continue;

  const prereqNotMet = topic.prerequisites.some((pre) => {
    const preMastery =
      statsMap[pre._id.toString()]?.masteryScore || 0;
    return preMastery < targetMastery * 0.6;
  });

  if (prereqNotMet) continue;

  const personalizedDifficulty = getPersonalizedDifficulty(
    topic.difficultyWeight,
    stat
  );

  const velocity = stat?.learningVelocity || 1;
  const safeVelocity = Math.max(0.1, velocity);

  let adjustedHours =
    topic.estimatedHoursToMaster *
    (personalizedDifficulty / 5);

  // Prevent instability
  adjustedHours = Math.max(5, adjustedHours);

  const efficiency =
    (deficit * topic.importanceWeight * safeVelocity) /
    adjustedHours;

  const variableName = `x_${topic._id.toString()}`;

  model.variables[variableName] = {
    score: efficiency,
    totalHours: 1,
    [variableName]: 1,
  };

  model.constraints[variableName] = {
    max: adjustedHours,
  };
}
  if (Object.keys(model.variables).length === 0) {
    return {
      totalDays,
      totalAvailableHours,
      allocation: [],
      feasibilityScore: 0,
      alerts: [],
    };
  }

  const results = solver.Solve(model);

  let allocation = [];

  Object.keys(results).forEach((key) => {
    if (key.startsWith("x_") && results[key] > 0) {
      const topicId = key.replace("x_", "");
      const allocated = Math.floor(results[key].toFixed(2));

      const currentMastery =
        statsMap[topicId]?.masteryScore || 0;

      allocation.push({
        topicId,
        allocatedHours: allocated,
        predictedMastery: predictMasteryGain(
          currentMastery,
          allocated,
          targetMastery
        ),
      });
    }
  });

  const feasibilityScore =
    calculateFeasibilityScore(allocation, targetMastery);

  const alerts = analyzeRisks(
    allocation,
    statsMap,
    targetMastery
  );

  return {
    totalDays,
    totalAvailableHours,
    allocation,
    feasibilityScore,
    alerts,
  };
};