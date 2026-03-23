import StudyLog from "../models/StudyLog.js";
import UserTopicStats from "../models/UserTopicStats.js";
import Topic from "../models/Topic.js";
import { applyDecay } from "../utils/decayCalculator.js";
import { calculateVelocity } from "../utils/velocityCalculator.js";

const updateMastery=async(userId,topicId)=>{
    const logs=await StudyLog.find({userId,topicId});
    const velocity = calculateVelocity(logs);
    stats.learningVelocity = velocity;
    if(logs.length===0){
        return null;
    }
    let totalAttempted = 0;
  let totalCorrect = 0;
  let totalTime = 0;

  logs.forEach((log) => {
    totalAttempted += log.problemsAttempted;
    totalCorrect += log.correct;
    totalTime += log.timeSpentMinutes;
  });

  const recentLogs = logs.slice(-5); // last 5 sessions

let smoothedAttempted = 0;
let smoothedCorrect = 0;

recentLogs.forEach((log) => {
  smoothedAttempted += log.problemsAttempted;
  smoothedCorrect += log.correct;
});

const accuracy =
  smoothedAttempted > 0
    ? (smoothedCorrect / smoothedAttempted) * 100
    : 0;
  
    

  recentLogs.forEach((log) => {
    totalTime += log.timeSpentMinutes;
  });

  const avgTimePerProblem =
    smoothedAttempted > 0
      ? totalTime / smoothedAttempted
     : 0;  

  // SpeedScore (simple inverse logic)
  const speedScore = avgTimePerProblem > 0 
    ? Math.max(0, 100 - avgTimePerProblem)
    : 0;

  const topic = await Topic.findById(topicId);
  const difficultyFactor = topic.difficultyWeight * 20;

  // Consistency score
  const consistencyScore = Math.min(100, logs.length * 5);

  let mastery =
    0.5 * accuracy +
    0.2 * speedScore +
    0.2 * difficultyFactor +
    0.1 * consistencyScore;

  // Fetch existing stats
  let stats = await UserTopicStats.findOne({ userId, topicId });

  if (stats) {
    mastery = applyDecay(mastery, stats.lastPracticed);

    stats.problemsSolved = totalCorrect;
    stats.accuracy = accuracy;
    stats.avgTimePerProblem = avgTimePerProblem;
    stats.masteryScore = mastery;
    stats.lastPracticed = new Date();

    await stats.save();
  } else {
    stats = await UserTopicStats.create({
      userId,
      topicId,
      problemsSolved: totalCorrect,
      accuracy,
      avgTimePerProblem,
      masteryScore: mastery,
      lastPracticed: new Date(),
    });
  }

  return stats;
}
export default updateMastery;