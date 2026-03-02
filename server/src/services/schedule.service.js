import DailySchedule from "../models/DailySchedule.js";

export const generateDailySchedule = async (
  userId,
  studyPlan,
  allocation
) => {
  const startDate = new Date(studyPlan.startDate);
  const deadline = new Date(studyPlan.deadline);

  const totalDays = Math.ceil(
    (deadline - startDate) / (1000 * 60 * 60 * 24)
  );

  const dailyHours = studyPlan.dailyAvailableHours;

  // Clear previous schedule for this plan
  await DailySchedule.deleteMany({
    studyPlanId: studyPlan._id,
  });

  let remainingAllocation = allocation.map((item) => ({
    topicId: item.topicId,
    remainingHours: item.allocatedHours,
  }));

  let currentDate = new Date(startDate);

  for (let day = 0; day < totalDays; day++) {
    let hoursLeftToday = dailyHours;
    let tasks = [];

    for (let topic of remainingAllocation) {
      if (hoursLeftToday <= 0) break;

      if (topic.remainingHours > 0) {
        const hoursForThisTopic = Math.min(
          topic.remainingHours,
          hoursLeftToday
        );

        tasks.push({
          topicId: topic.topicId,
          allocatedHours: hoursForThisTopic,
        });

        topic.remainingHours -= hoursForThisTopic;
        hoursLeftToday -= hoursForThisTopic;
      }
    }

    if (tasks.length > 0) {
      await DailySchedule.create({
        userId,
        studyPlanId: studyPlan._id,
        date: new Date(currentDate),
        tasks,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }
};