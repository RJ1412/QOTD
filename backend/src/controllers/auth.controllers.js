import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../libs/db.js";

dotenv.config();

export const register = async (req, res) => {
    const { srn, email, password } = req.body;

    if (!srn || !email || !password) {
        return res.status(400).json({ error: "SRN, Email, and Password are required" });
    }

    try {
        const existingUser = await db.user.findFirst({
            where: {
                OR: [{ srn }, { email }]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this SRN or Email" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.user.create({
            data: {
                srn,
                email,
                password: hashedPassword
            }
        });

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 1000 * 60 * 60 * 24 * 7
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser.id,
                srn: newUser.srn,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req, res) => {
    const { srn, email, password } = req.body;

    if ((!srn && !email) || !password) {
        return res.status(400).json({ error: "SRN or Email and Password are required" });
    }

    try {
        const user = await db.user.findFirst({
            where: {
                OR: [
                    srn ? { srn } : undefined,
                    email ? { email } : undefined
                ]
            }
        });

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 1000 * 60 * 60 * 24 * 7
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                srn: user.srn,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development"
        });

        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const verify = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "User verified",
            user: req.user
        });
    } catch (error) {
        console.error("Verify error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const forgotPassword = async (req, res) => {
    // Stub implementation - depends on email service, tokens, etc.
    res.status(200).json({
        success: true,
        message: "Forgot password route hit - not implemented"
    });
};
