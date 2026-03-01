import express from "express";

import {createTopic,
  getAllTopics,
} from "../controllers/topic.controller.js";
import protect from "../middleware/auth.middleware.js";

const router=express.Router();

router.post("/",protect,createTopic);
router.get("/",protect,getAllTopics);

export default router;