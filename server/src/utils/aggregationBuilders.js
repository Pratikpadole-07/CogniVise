import mongoose from "mongoose";

/*
  Utility file for reusable MongoDB aggregation pipelines.

  Purpose:
  - avoid repeating long pipelines
  - centralize analytics queries
  - cleaner controllers
*/

export const objectId = (id) =>
  new mongoose.Types.ObjectId(id);

/* --------------------------------------------------
   1. Topic Accuracy Summary
-------------------------------------------------- */
export const buildTopicAccuracyPipeline = (userId) => [
  {
    $match: {
      userId: objectId(userId),
    },
  },
  {
    $group: {
      _id: "$topicId",
      totalAttempted: {
        $sum: "$problemsAttempted",
      },
      totalCorrect: {
        $sum: "$correct",
      },
    },
  },
  {
    $lookup: {
      from: "topics",
      localField: "_id",
      foreignField: "_id",
      as: "topic",
    },
  },
  {
    $unwind: "$topic",
  },
  {
    $project: {
      _id: 0,
      topicId: "$_id",
      topicName: "$topic.name",
      totalAttempted: 1,
      totalCorrect: 1,
      accuracy: {
        $round: [
          {
            $multiply: [
              {
                $cond: [
                  { $eq: ["$totalAttempted", 0] },
                  0,
                  {
                    $divide: [
                      "$totalCorrect",
                      "$totalAttempted",
                    ],
                  },
                ],
              },
              100,
            ],
          },
          2,
        ],
      },
    },
  },
  {
    $sort: {
      accuracy: -1,
    },
  },
];

/* --------------------------------------------------
   2. Weekly Study Time Trend
-------------------------------------------------- */
export const buildWeeklyTimePipeline = (userId) => [
  {
    $match: {
      userId: objectId(userId),
    },
  },
  {
    $group: {
      _id: {
        year: {
          $isoWeekYear: "$createdAt",
        },
        week: {
          $isoWeek: "$createdAt",
        },
      },
      totalMinutes: {
        $sum: "$timeSpentMinutes",
      },
    },
  },
  {
    $project: {
      _id: 0,
      label: {
        $concat: [
          "W",
          { $toString: "$_id.week" },
        ],
      },
      totalHours: {
        $round: [
          {
            $divide: [
              "$totalMinutes",
              60,
            ],
          },
          2,
        ],
      },
    },
  },
  {
    $sort: {
      label: 1,
    },
  },
];

/* --------------------------------------------------
   3. Topic Time Distribution
-------------------------------------------------- */
export const buildTopicTimePipeline = (userId) => [
  {
    $match: {
      userId: objectId(userId),
    },
  },
  {
    $group: {
      _id: "$topicId",
      totalMinutes: {
        $sum: "$timeSpentMinutes",
      },
    },
  },
  {
    $lookup: {
      from: "topics",
      localField: "_id",
      foreignField: "_id",
      as: "topic",
    },
  },
  {
    $unwind: "$topic",
  },
  {
    $project: {
      _id: 0,
      topicName: "$topic.name",
      totalHours: {
        $round: [
          {
            $divide: [
              "$totalMinutes",
              60,
            ],
          },
          2,
        ],
      },
    },
  },
  {
    $sort: {
      totalHours: -1,
    },
  },
];

/* --------------------------------------------------
   4. Consistency Score (days active)
-------------------------------------------------- */
export const buildConsistencyPipeline = (userId) => [
  {
    $match: {
      userId: objectId(userId),
    },
  },
  {
    $group: {
      _id: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$createdAt",
        },
      },
    },
  },
  {
    $count: "activeDays",
  },
];

/* --------------------------------------------------
   5. Dashboard Summary
-------------------------------------------------- */
export const buildDashboardSummaryPipeline = (userId) => [
  {
    $match: {
      userId: objectId(userId),
    },
  },
  {
    $group: {
      _id: null,
      totalProblems: {
        $sum: "$problemsAttempted",
      },
      totalCorrect: {
        $sum: "$correct",
      },
      totalMinutes: {
        $sum: "$timeSpentMinutes",
      },
    },
  },
  {
    $project: {
      _id: 0,
      totalProblems: 1,
      totalCorrect: 1,
      totalHours: {
        $round: [
          {
            $divide: [
              "$totalMinutes",
              60,
            ],
          },
          2,
        ],
      },
      accuracy: {
        $round: [
          {
            $multiply: [
              {
                $cond: [
                  { $eq: ["$totalProblems", 0] },
                  0,
                  {
                    $divide: [
                      "$totalCorrect",
                      "$totalProblems",
                    ],
                  },
                ],
              },
              100,
            ],
          },
          2,
        ],
      },
    },
  },
];