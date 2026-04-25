import cron from "node-cron";
import StudyPlan from "../models/StudyPlan.js";
import DailySchedule from "../models/DailySchedule.js";
import { generateOptimizedPlan } from "../services/optimization.service.js";
import { generateDailySchedule } from "../services/schedule.service.js";

export const startDailyRecalculationJob = () => {
  // Runs every day at 12:00 AM
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily recalculation job...");

    try {
      const activePlans = await StudyPlan.find({
        isActive: true,
      });

      for (const plan of activePlans) {
        try {
          const today = new Date();

          // Skip expired plans
          if (new Date(plan.deadline) <= today) {
            await StudyPlan.findByIdAndUpdate(plan._id, {
              isActive: false,
            });

            continue;
          }

          // Recalculate optimized plan
          const result = await generateOptimizedPlan(
            plan.userId,
            plan.dailyAvailableHours,
            plan.deadline,
            plan.targetMastery
          );

          // If no valid allocation, skip
          if (!result.allocation.length) {
            continue;
          }

          // Update study plan
          await StudyPlan.findByIdAndUpdate(plan._id, {
            topicDistribution: result.allocation,
            updatedAt: new Date(),
          });

          // Delete old future schedule
          await DailySchedule.deleteMany({
            userId: plan.userId,
            date: { $gte: today },
          });

          // Generate fresh schedule
          const refreshedPlan = await StudyPlan.findById(
            plan._id
          );

          await generateDailySchedule(
            plan.userId,
            refreshedPlan,
            result.allocation
          );

          console.log(
            `Plan recalculated for user ${plan.userId}`
          );
        } catch (err) {
          console.log(
            `Failed recalculation for user ${plan.userId}: ${err.message}`
          );
        }
      }

      console.log("Daily recalculation job completed.");
    } catch (error) {
      console.log(
        "Daily recalculation job failed:",
        error.message
      );
    }
  });
};