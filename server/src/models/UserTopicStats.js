import mongoose from "mongoose";

const userTopicStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },

    problemsSolved: {
      type: Number,
      default: 0,
    },

    accuracy: {
      type: Number,
      default: 0,
    },

    avgTimePerProblem: {
      type: Number,
      default: 0,
    },

    masteryScore: {
      type: Number,
      default: 0,
    },

    lastPracticed: {
      type: Date,
    },
    learningVelocity: {
    type: Number,
    default: 0,
    },
  },
  { timestamps: true }
);

// Compound index for fast lookup
userTopicStatsSchema.index({ userId: 1, topicId: 1 }, { unique: true });

const UserTopicStats = mongoose.model(
  "UserTopicStats",
  userTopicStatsSchema
);

export default UserTopicStats;