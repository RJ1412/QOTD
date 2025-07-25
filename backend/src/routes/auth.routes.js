import express from "express";
import { login, register ,logout ,verifyOtp, forgotPassword, getCurrentUser  } from "../controllers/auth.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const authRoutes = express.Router();

authRoutes.post("/register" , register)

authRoutes.post("/login" , login)

authRoutes.post("/logout" ,authMiddleware, logout)

authRoutes.post("/forgot-password" , forgotPassword)

authRoutes.post("/verify" , verifyOtp);


authRoutes.get("/me",authMiddleware, getCurrentUser)
export default authRoutes;