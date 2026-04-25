 /*
  efficiencyCalculator.js

  Purpose:
  Measures how effectively a user converts study time
  into learning outcomes.

  Used inside:
  - analytics
  - optimizer scoring
  - dashboard metrics
*/

/* ------------------------------------------
   1. Core Efficiency Score
------------------------------------------ */
/*
Inputs:
accuracy            -> 0 to 100
masteryGain         -> score improvement
hoursSpent          -> total hours spent

Output:
0 to 100+
*/
export const calculateEfficiencyScore = ({
  accuracy = 0,
  masteryGain = 0,
  hoursSpent = 1,
}) => {
  const safeHours = Math.max(hoursSpent, 0.5);

  const score =
    (accuracy * 0.5 +
      masteryGain * 1.2) /
    safeHours;

  return Number(score.toFixed(2));
};

/* ------------------------------------------
   2. Weekly Efficiency
------------------------------------------ */
/*
Compares progress vs weekly effort
*/
export const calculateWeeklyEfficiency = ({
  weeklyHours = 0,
  solvedProblems = 0,
  avgAccuracy = 0,
}) => {
  const safeHours = Math.max(weeklyHours, 1);

  const score =
    (solvedProblems * 2 +
      avgAccuracy * 0.4) /
    safeHours;

  return Number(score.toFixed(2));
};

/* ------------------------------------------
   3. Time Utilization %
------------------------------------------ */
/*
How much planned time was actually used
*/
export const calculateTimeUtilization = ({
  plannedHours = 0,
  actualHours = 0,
}) => {
  if (plannedHours <= 0) return 0;

  const percent =
    (actualHours / plannedHours) * 100;

  return Number(
    Math.min(percent, 100).toFixed(2)
  );
};

/* ------------------------------------------
   4. Performance Per Hour
------------------------------------------ */
/*
Problems solved per hour adjusted by accuracy
*/
export const calculatePerformancePerHour = ({
  solvedProblems = 0,
  accuracy = 0,
  hoursSpent = 1,
}) => {
  const safeHours = Math.max(hoursSpent, 0.5);

  const score =
    (solvedProblems *
      (accuracy / 100)) /
    safeHours;

  return Number(score.toFixed(2));
};

/* ------------------------------------------
   5. Efficiency Label
------------------------------------------ */
export const getEfficiencyLabel = (
  score = 0
) => {
  if (score >= 25) return "Excellent";
  if (score >= 15) return "Good";
  if (score >= 8) return "Average";
  if (score >= 4) return "Low";
  return "Poor";
};

/* ------------------------------------------
   6. Full Efficiency Object
------------------------------------------ */
export const buildEfficiencyReport = ({
  accuracy = 0,
  masteryGain = 0,
  hoursSpent = 1,
  solvedProblems = 0,
}) => {
  const score =
    calculateEfficiencyScore({
      accuracy,
      masteryGain,
      hoursSpent,
    });

  const perHour =
    calculatePerformancePerHour({
      solvedProblems,
      accuracy,
      hoursSpent,
    });

  return {
    score,
    label: getEfficiencyLabel(score),
    performancePerHour: perHour,
  };
};