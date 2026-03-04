import StudyPlan from "../models/StudyPlan.js";
import DailySchedule from "../models/DailySchedule.js";
import { generateOptimizedPlan } from "../services/optimization.service.js";
import { generateDailySchedule } from "../services/schedule.service.js";

export const createStudyPlan = async (req, res) => {
  try {
    const userId = req.user._id;

    const { dailyAvailableHours, deadline, targetMastery } = req.body;

    if (!dailyAvailableHours || !deadline) {
      return res
        .status(400)
        .json({ message: "Daily hours and deadline required" });
    }

    if (dailyAvailableHours <= 0) {
      return res
        .status(400)
        .json({ message: "Daily hours must be greater than 0" });
    }

    // Generate optimized allocation
    const optimizationResult = await generateOptimizedPlan(
      userId,
      dailyAvailableHours,
      deadline,
      targetMastery
    );

    if (!optimizationResult.allocation.length) {
      return res.status(400).json({
        message: "No topics eligible for allocation",
      });
    }

    // Deactivate old plans
    await StudyPlan.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    // Create new plan
    const newPlan = await StudyPlan.create({
      userId,
      startDate: new Date(),
      deadline,
      dailyAvailableHours,
      targetMastery: targetMastery || 85,
      topicDistribution: optimizationResult.allocation,
      isActive: true,
    });

    // Generate daily schedule
    await generateDailySchedule(
      userId,
      newPlan,
      optimizationResult.allocation
    );

    res.status(201).json({
      message: "Study plan generated successfully",
      plan: newPlan,
      optimizationMeta: {
        totalDays: optimizationResult.totalDays,
        totalAvailableHours:
          optimizationResult.totalAvailableHours,
        feasibilityScore: optimizationResult.feasibilityScore 
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
    }).populate("topicDistribution.topicId", "name difficultyWeight importanceWeight");

    if (!plan) {
      return res.status(404).json({ message: "No active plan" });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSchedule = async (req, res) => {
  try {
    const userId = req.user._id;

    const schedule = await DailySchedule.find({ userId })
      .populate("tasks.topicId", "name")
      .sort({ date: 1 });

    if (!schedule.length) {
      return res.status(404).json({
        message: "No schedule found. Generate a plan first.",
      });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};