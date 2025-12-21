import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";

import connectDB from "./mongodb/connect.js";
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";

dotenv.config();

const app = express();

// Allow credentials is no longer needed since we're not using cookies
app.use(cors({
  origin: [
    "https://tafasee-dashbaord.netlify.app", // ✅ FIXED
    "https://www.tafaseelarch.com",
    "https://tafaseelarch.com",
    "http://localhost:3000",
    "http://localhost:5173",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.options("*", cors());

app.use(express.json({ limit: "200mb" }));

app.get("/", (req, res) => {
  res.send({ message: "Tafaseel API is running!" });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/auth", userRouter); // separate auth route

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error(error);
  }
};

startServer();