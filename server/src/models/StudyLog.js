import mongoose from "mongoose";

const studyLogSchema = new mongoose.Schema(
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

    problemsAttempted: {
      type: Number,
      required: true,
    },

    correct: {
      type: Number,
      required: true,
    },

    timeSpentMinutes: {
      type: Number,
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

const StudyLog = mongoose.model("StudyLog", studyLogSchema);

export default StudyLog;