import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],

    difficultyWeight: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    importanceWeight: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    estimatedHoursToMaster: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Topic = mongoose.model("Topic", topicSchema);

export default Topic;