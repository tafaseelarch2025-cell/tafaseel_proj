import express from "express";
import {
  getAllUsers,
  createUser,
  getUserInfoByID,
  updateUser,
  loginUser,
  changePassword,  // ← Make sure this is imported
} from "../controllers/user.controller.js";

const router = express.Router();

/* ==========================
   AUTH ROUTE (FIRST)
========================== */
router.post("/login", loginUser);

/* ==========================
   LIST & CREATE (collection routes)
========================== */
router.get("/", getAllUsers);
router.post("/", createUser);

/* ==========================
   NEW: SPECIFIC ACTIONS (MUST COME BEFORE :id)
========================== */
router.post("/:id/change-password", changePassword);  // ← MOVED UP!

/* ==========================
   DYNAMIC ROUTES (LAST - generic catch-all)
========================== */
router.get("/:id", getUserInfoByID);
router.put("/:id", updateUser);

export default router;