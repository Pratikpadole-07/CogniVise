import mongoose from "mongoose";

const dailyScheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    studyPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyPlan",
      required: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    tasks: [
      {
        topicId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Topic",
        },

        allocatedHours: Number,
      },
    ],

    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const DailySchedule = mongoose.model(
  "DailySchedule",
  dailyScheduleSchema
);

export default DailySchedule;