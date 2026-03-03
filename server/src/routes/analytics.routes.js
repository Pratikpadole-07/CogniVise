import express from "express";
import {fetchAnalytics} from "../controllers/analytics.controller.js";
import protect from "../middleware/auth.middleware.js";

const router=express.Router();

router.get("/",protect,fetchAnalytics);

export default router;