import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import protect from "./middleware/auth.middleware.js";
import studyLogRoutes from "./routes/studyLog.routes.js";
import topicRoutes from "./routes/topic.routes.js";

const app=express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/study-logs", studyLogRoutes);
app.use("/api/topics", topicRoutes);
app.get("/api/test", protect, (req, res) => {
  res.json({ message: "Protected route working", user: req.user });
});
export default app;
