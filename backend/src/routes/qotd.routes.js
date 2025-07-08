import express from "express";
import { getDailyUniqueCodeforcesQuestion, linkCodeforcesHandle } from "../controllers/qotd.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const qotdRoutes = express.Router();

qotdRoutes.post("/link-codeforces", authMiddleware, linkCodeforcesHandle);
qotdRoutes.get("/get-questions" ,authMiddleware, getDailyUniqueCodeforcesQuestion);

export default qotdRoutes;