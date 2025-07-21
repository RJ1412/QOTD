import express from "express";

import {
  getDailyUniqueCodeforcesQuestion,
  linkCodeforcesHandle,
  getTodayQuestion,
  UpdatePoints,
  getLeaderboard,
  getAllQuestions,
  getRecentSubmissionsFromCF,
  getHandle,
} from "../controllers/qotd.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const qotdRoutes = express.Router();

qotdRoutes.post("/link-cf", authMiddleware, linkCodeforcesHandle);
qotdRoutes.get("/get-questions", authMiddleware, getDailyUniqueCodeforcesQuestion);
qotdRoutes.get("/today", authMiddleware, getTodayQuestion);
qotdRoutes.post("/update-status", authMiddleware, UpdatePoints);
qotdRoutes.get("/leaderboard", authMiddleware, getLeaderboard);
qotdRoutes.get("/all", authMiddleware, getAllQuestions);
qotdRoutes.get("/submission", authMiddleware, getRecentSubmissionsFromCF);
qotdRoutes.get("/cf-handle", authMiddleware, getHandle);

export default qotdRoutes;
