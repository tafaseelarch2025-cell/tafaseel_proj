import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";

import connectDB from "./mongodb/connect.js";
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";
import loginRouter from "./routes/user.routes.js";
dotenv.config();
// auth.routes.js



const app = express();
app.use(
  cors({
    origin: [
      "https://tafasee-dashbaord.netlify.app",
      "https://www.tafaseelarch.com",
      "https://tafaseelarch.com",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "200mb" }));

app.get("/", (req, res) => {
  res.send({ message: "Hello World!" });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/auth", loginRouter); 

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL, {
      dbName: 'tafaseel_db',
       useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

  } catch (error) {
    console.log(error);
  }
};

startServer();
