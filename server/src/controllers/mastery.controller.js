import UserTopicStats from "../models/UserTopicStats.js";

export const getMasteryStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await UserTopicStats.find({
      userId,
    }).populate("topicId", "name");

    const formatted = stats.map((item) => ({
      topicId: item.topicId?._id,
      topicName: item.topicId?.name || "Unknown",
      masteryScore: item.masteryScore,
      accuracy: item.accuracy,
      avgTimePerProblem: item.avgTimePerProblem,
      learningVelocity: item.learningVelocity,
      lastPracticed: item.lastPracticed,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};