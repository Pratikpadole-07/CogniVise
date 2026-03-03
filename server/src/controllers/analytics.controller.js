import {
  getWeeklyAccuracy,
  getTimeSpentPerTopic,
  getConsistencyIndex,
} from "../services/analytics.service.js";


export const fetchAnalytics=async (req,res)=>{
    try{
        const userId = req.user._id;
        const weeklyAccuracy = await getWeeklyAccuracy(userId);
        const timeSpent = await getTimeSpentPerTopic(userId);
        const consistency = await getConsistencyIndex(userId);

        res.json({
            weeklyAccuracy,
            timeSpent,
            consistency,
        });
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
}