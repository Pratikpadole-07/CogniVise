import express from "express";
import {
  createStudyPlan,
  getActivePlan,
} from "../controllers/studyPlan.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createStudyPlan);
router.get("/active", protect, getActivePlan);

export default router;