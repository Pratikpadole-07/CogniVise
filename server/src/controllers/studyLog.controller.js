import StudyLog from "../models/StudyLog.js";
import updateMastery from "../services/mastery.service.js";

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

    const log = await StudyLog.create({
      userId,
      topicId,
      problemsAttempted,
      correct,
      timeSpentMinutes,
    });

    // Recalculate mastery immediately
    const updatedStats = await updateMastery(userId, topicId);

    res.status(201).json({
      message: "Study log created",
      log,
      updatedStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};