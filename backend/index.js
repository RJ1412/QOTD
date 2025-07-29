import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.routes.js"; 
import qotdRoutes from "./src/routes/qotd.routes.js";
import cron from "node-cron";
import axios from "axios";
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;
cron.schedule("00 00 * * *", async () => {
  try {
    console.log("🔔 Running QOTD Fetch Job...");

    const res = await axios.get("http://localhost:3000/api/v1/qotd/get-questions"); // replace with deployed URL in prod

    console.log("✅ QOTD Fetched:", res.data);
  } catch (err) {
    console.error("❌ QOTD Fetch Failed:", err.message);
  }
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("RJ is here");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/qotd", qotdRoutes); 

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
