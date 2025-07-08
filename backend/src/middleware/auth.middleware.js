import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid or expired token"
            });
        }

        const user = await db.user.findUnique({
            where: {
                id: decoded.id
            },
            select: {
                id: true,
                srn: true,
                email: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error authenticating user:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const checkAdmin = async (req, res, next) => {
    try {
        const userId = req.user?.id;

        const user = await db.user.findUnique({
            where: {
                id: userId
            },
            select: {
                role: true
            }
        });

        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Access denied - Admins only"
            });
        }

        next();
    } catch (error) {
        console.error("Error checking admin role:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
