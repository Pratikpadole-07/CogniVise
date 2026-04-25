import express from "express";
import protect from "../middleware/auth.middleware.js";
import { getMasteryStats } from "../controllers/mastery.controller.js";

const router = express.Router();

router.get("/", protect, getMasteryStats);

export default router;