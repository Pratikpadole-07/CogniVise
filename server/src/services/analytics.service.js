import StudyLog from "../models/StudyLog.js";


export const getWeeklyAccuracy = async (userId) =>{
    const result=await StudyLog.aggregate([
        {
            $match:{
                userId,
            },
        },
        {
            $group:{
                _id: {
                    year: { $year: "$date" },
                    week: { $week: "$date" },
                    },
                    totalAttempted: { $sum: "$problemsAttempted" },
                    totalCorrect: { $sum: "$correct" },
            },
        },
        {
            $project:{
                year:"$_id.year",
                week:"$_id.week",
                accuracy:{
                    $multiply:[
                        { $divide:["$totalCorrect", "$totalAttempted"]},
                        100,
                    ],
                },
            },
        },
        { $sort:{year:1,week:1}}
    ]);
    return result;
};
export const getTimeSpentPerTopic = async (userId) => {
  const result = await StudyLog.aggregate([
    {
      $match: { userId },
    },
    {
      $group: {
        _id: "$topicId",
        totalMinutes: { $sum: "$timeSpentMinutes" },
      },
    },
  ]);

  return result;
};

export const getConsistencyIndex = async (userId) => {
  const result = await StudyLog.aggregate([
    {
      $match: { userId },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        },
      },
    },
    {
      $group: {
        _id: null,
        activeDays: { $sum: 1 },
      },
    },
  ]);

  return result[0]?.activeDays || 0;
};