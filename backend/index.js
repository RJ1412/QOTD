import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.json()) 
app.use(cookieParser());
const PORT = process.env.PORT;

app.use(
    cors({
      origin: "http//localhost:8080:",
      credentials: true,
    })
  );
app.listen(PORT ,() =>{
    console.log(`server is running on ${PORT}`)
})

app.get("/" , (req , res) => {
    res.send("RJ is here")
})

app.use("/api/v1/auth" , authRoutes)
