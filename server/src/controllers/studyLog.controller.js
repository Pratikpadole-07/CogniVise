import StudyLog from "../models/StudyLog.js";
import StudyPlan from "../models/StudyPlan.js";
import updateMastery from "../services/mastery.service.js";
import  {generateOptimizedPlan}  from "../services/optimization.service.js";

export const createStudyLog = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      topicId,
      problemsAttempted,
      correct,
      timeSpentMinutes,
    } = req.body;

    if (!topicId || !problemsAttempted || correct === undefined || !timeSpentMinutes) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (correct > problemsAttempted) {
      return res.status(400).json({ message: "Correct cannot exceed attempted" });
    }

    // 1. Save study log
    const log = await StudyLog.create({
      userId,
      topicId,
      problemsAttempted,
      correct,
      timeSpentMinutes,
    });

    // 2. Update mastery
    await updateMastery(userId, topicId);

    // 3. Check if active plan exists
    const activePlan = await StudyPlan.findOne({
      userId,
      isActive: true,
    });

    let regeneratedPlan = null;

    if (activePlan) {
      const optimizationResult = await generateOptimizedPlan(
        userId,
        activePlan.dailyAvailableHours,
        activePlan.deadline,
        activePlan.targetMastery
      );

      activePlan.topicDistribution = optimizationResult.allocation;
      await activePlan.save();

      regeneratedPlan = activePlan;
    }

    res.status(201).json({
      message: "Study log created and plan updated",
      log,
      regeneratedPlan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};