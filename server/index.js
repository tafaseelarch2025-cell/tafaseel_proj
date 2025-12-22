import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./mongodb/connect.js";
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";

dotenv.config();

const app = express();

/* ==========================
   TRUST PROXY (REQUIRED)
========================== */
app.set("trust proxy", 1);

/* ==========================
   MIDDLEWARES
========================== */
app.use(express.json({ limit: "20mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "https://tafaseel-proj.vercel.app",
      "https://www.tafaseelarch.com",
      "https://tafaseelarch.com",
      "https://tafasee-dashbaord.netlify.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

/* ==========================
   ROUTES
========================== */
app.get("/", (req, res) => {
  res.status(200).json({ message: "Tafaseel API is running 🚀" });
});

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);

/* ==========================
   START SERVER
========================== */
const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URL, {
      dbName: "tafaseel_db",
    });

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
};

startServer();