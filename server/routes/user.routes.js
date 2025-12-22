import express from "express";
import {
  createUser,
  getAllUsers,
  getUserInfoByID,
  updateUser,
  loginUser,
} from "../controllers/user.controller.js";

const router = express.Router();

/* ==========================
   AUTH ROUTE (FIRST)
========================== */
router.post("/login", loginUser);

/* ==========================
   USER ROUTES
========================== */
router.get("/", getAllUsers);
router.post("/", createUser);

/* Dynamic routes must come last */
router.get("/:id", getUserInfoByID);
router.put("/:id", updateUser);

export default router;
