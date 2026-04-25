import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import protect from "./middleware/auth.middleware.js";
import studyLogRoutes from "./routes/studyLog.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import studyPlanRoutes from "./routes/studyPlan.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import masteryRoutes from "./routes/mastery.routes.js";



const app=express();
app.use(
  cors({
    origin: [
    "http://localhost:5173",
    "http://localhost:5174"
  ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/study-logs", studyLogRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/study-plans", studyPlanRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/mastery", masteryRoutes);

app.get("/api/test", protect, (req, res) => {
  res.json({ message: "Protected route working", user: req.user });
});
export default app;
