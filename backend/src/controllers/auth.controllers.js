import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../libs/db.js";
import transporter from "../libs/nodemailer.js";
import { generateEmailTemplate } from "../libs/EmailTemplate.js";

dotenv.config();

const tempUsers = new Map();

export const register = async (req, res) => {
    const { srn, email, password } = req.body;

    if (!srn || !email || !password) {
        return res.status(400).json({ error: "SRN, Email, and Password are required" });
    }

    try {
        const existingUser = await db.user.findFirst({ where: { OR: [{ srn }, { email }] } });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const hashedPassword = await bcrypt.hash(password, 10);

        tempUsers.set(email, {
            srn,
            email,
            password: hashedPassword,
            otp,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000
        });

        const otpEmail = generateEmailTemplate("otp", { name: srn, otp, expires: "24 hours" });

        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: otpEmail.subject,
            html: otpEmail.html
        });

        res.status(200).json({ message: "OTP sent to your email. Verify to complete registration." });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ error: "Failed to initiate registration" });
    }
};

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const tempUser = tempUsers.get(email);

    if (!tempUser) return res.status(400).json({ error: "Please register again." });
    if (Date.now() > tempUser.expiresAt) {
        tempUsers.delete(email);
        return res.status(400).json({ error: "OTP expired. Please register again." });
    }
    if (tempUser.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

    try {
        const newUser = await db.user.create({
            data: {
                srn: tempUser.srn,
                email: tempUser.email,
                password: tempUser.password
            }
        });

        tempUsers.delete(email);

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 1000 * 60 * 60 * 24 * 7
        });

        res.status(201).json({
            success: true,
            message: "User verified and registered successfully",
            user: {
                id: newUser.id,
                srn: newUser.srn,
                email: newUser.email
            }
        });
    } catch (err) {
        console.error("Verify OTP error:", err);
        res.status(500).json({ error: "Verification failed" });
    }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    const user = await db.user.findUnique({ where: { email } });

    if (!user)
      return res.status(401).json({ error: "User not found with this email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        srn: user.srn,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
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
        res.status(200).json({ success: true, message: "User logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const forgotPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const user = await db.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: "User not found" });

        // 🧩 If newPassword and otp exist — it's a reset request
        if (otp && newPassword) {
            if (otp !== user.resetToken) {
                return res.status(400).json({ error: "Invalid OTP" });
            }

            if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
                return res.status(400).json({ error: "OTP expired" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await db.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    resetToken: null,
                    resetTokenExpiry: null,
                },
            });

            return res.status(200).json({ message: "Password reset successful" });
        }

        // 🔁 Else, it's a request to send OTP
        const resetToken = String(Math.floor(100000 + Math.random() * 900000));
        const expiry = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

        await db.user.update({
            where: { email },
            data: { resetToken, resetTokenExpiry: expiry },
        });

        const resetEmail = generateEmailTemplate("reset-password", {
            otp: resetToken,
            expires: "10 minutes",
        });

        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: resetEmail.subject,
            html: resetEmail.html,
        });

        return res.status(200).json({ message: "OTP sent to email" });

    } catch (error) {
        console.log("Forgot/reset password error:", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
};
