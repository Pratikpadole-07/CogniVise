import mongoose from "mongoose";

const topicAllocationSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },

    allocatedHours: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    dailyAvailableHours: {
      type: Number,
      required: true,
    },

    targetMastery: {
      type: Number,
      default: 85,
    },

    topicDistribution: [topicAllocationSchema],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const StudyPlan = mongoose.model("StudyPlan", studyPlanSchema);

export default StudyPlan;