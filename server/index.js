import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./mongodb/connect.js";
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";

dotenv.config();

const app = express();

// TRUST PROXY (for secure cookies in production)
app.set("trust proxy", 1);

// MIDDLEWARES
app.use(cors({
  origin: [
    "https://tafaseel-proj-wrmb.vercel.app",  
    "https://tafaseel-proj-tafaseelarch2025-cells-projects.vercel.app",
    "http://localhost:3000",
    "https://www.tafaseelarch.com",
    "https://tafaseelarch.com",
  ],
}));
app.use(express.json({ limit: "20mb" }));
app.use(cookieParser());

// ROUTES
app.use("/api/v1/users", userRouter);       // ✅ Mount users under /users
app.use("/api/v1/projects", projectRouter); // ✅ Mount projects under /projects

app.get("/", (req, res) => {
  res.status(200).json({ message: "Tafaseel API is running 🚀" });
});

// START SERVER
const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URL, { dbName: "tafaseel_db" });
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
};

startServer();
