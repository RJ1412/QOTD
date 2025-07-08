import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.routes.js"; 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:8080", 
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("RJ is here");
});

app.use("/api/v1/auth", authRoutes); 

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
