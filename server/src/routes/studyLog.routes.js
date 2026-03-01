import express from "express";
import { createStudyLog } from "../controllers/studyLog.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected route
router.post("/", protect, createStudyLog);

export default router;