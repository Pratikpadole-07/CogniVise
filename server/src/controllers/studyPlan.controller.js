import StudyPlan from "../models/StudyPlan.js";
import { generateOptimizedPlan } from "../services/optimization.service.js";

export const createStudyPlan = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      dailyAvailableHours,
      deadline,
      targetMastery,
    } = req.body;

    if (!dailyAvailableHours || !deadline) {
      return res
        .status(400)
        .json({ message: "Daily hours and deadline required" });
    }

    // Generate optimized allocation
    const optimizationResult = await generateOptimizedPlan(
      userId,
      dailyAvailableHours,
      deadline,
      targetMastery
    );

    // Deactivate old plans
    await StudyPlan.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    // Store new plan
    const newPlan = await StudyPlan.create({
      userId,
      startDate: new Date(),
      deadline,
      dailyAvailableHours,
      targetMastery: targetMastery || 85,
      topicDistribution: optimizationResult.allocation,
      isActive: true,
    });

    res.status(201).json({
      message: "Study plan generated successfully",
      plan: newPlan,
      optimizationMeta: {
        totalDays: optimizationResult.totalDays,
        totalAvailableHours:
          optimizationResult.totalAvailableHours,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActivePlan = async (req, res) => {
  try {
    const userId = req.user._id;

    const plan = await StudyPlan.findOne({
      userId,
      isActive: true,
    }).populate("topicDistribution.topicId", "name");

    if (!plan) {
      return res.status(404).json({ message: "No active plan" });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};