import express from "express";
import { login, register ,logout , verify , forgotPassword } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const authRoutes = express.Router();

authRoutes.post("/register" , register)

authRoutes.post("/login" , login)

authRoutes.post("/logout" ,authMiddleware, logout)

authRoutes.get("/forgot-password" , forgotPassword)

authRoutes.get("/verify" , verify);



export default authRoutes;