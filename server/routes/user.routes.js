import express from "express";

import {
  createUser,
  getAllUsers,
 getUserInfoByID,
 updateUser,
 loginUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.route("/").get(getAllUsers);
router.route("/").post(createUser);
router.route("/:id").get(getUserInfoByID);
router.put("/:id", updateUser); // <-- allow updates
router.post("/login", loginUser);



export default router;
