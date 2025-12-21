import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";

import connectDB from "./mongodb/connect.js";
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";
import authRouter from "./routes/auth.routes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://tafasee-dashbaord.netlify.app",
  "https://www.tafaseelarch.com",
  "https://tafaseelarch.com",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.options("*", cors());

// FORCE headers for ORB
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express.json({ limit: "200mb" }));

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/auth", authRouter);

// catch HTML responses (ORB killer)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URL, {
      dbName: "tafaseel_db",
    });

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  } catch (error) {
    console.log(error);
  }
};

startServer();
