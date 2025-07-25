import express from "express";

import {
  linkCodeforcesHandle,
  getTodayQuestion,
  UpdatePoints,
  getLeaderboard,
  getAllQuestions,
  getRecentSubmissionsFromCF,
  getHandle,
  generateGlobalQOTD,
} from "../controllers/qotd.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const qotdRoutes = express.Router();

qotdRoutes.post("/link-cf", authMiddleware, linkCodeforcesHandle);
qotdRoutes.get("/get-questions",  generateGlobalQOTD);
qotdRoutes.get("/today", authMiddleware, getTodayQuestion);
qotdRoutes.post("/update-status", UpdatePoints);
qotdRoutes.get("/leaderboard", authMiddleware, getLeaderboard);
qotdRoutes.get("/all", authMiddleware, getAllQuestions);
qotdRoutes.get("/submission", authMiddleware, getRecentSubmissionsFromCF);
qotdRoutes.get("/cf-handle", authMiddleware, getHandle);

export default qotdRoutes;
