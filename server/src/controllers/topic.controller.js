import Topic from "../models/Topic.js";

export const createTopic =async (req,res)=>{
    try{
        const {
            name,
            prerequisites,
            difficultyWeight,
            importanceWeight,
            estimatedHoursToMaster,
            } = req.body;

        if(!name || !difficultyWeight || !importanceWeight || !estimatedHoursToMaster){
            return res.status(400).json({message:"Required fields missing"});
        }

        const topic=await Topic.create({
            name,
            prerequisites: prerequisites || [],
            difficultyWeight,
            importanceWeight,
            estimatedHoursToMaster,
        });
        res.status(201).json(topic);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
};
export const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find().populate("prerequisites", "name");
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
