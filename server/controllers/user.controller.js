import User from "../mongodb/models/user.js";
import cloudinary from "cloudinary";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ==========================
   CLOUDINARY CONFIG
========================== */
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ==========================
   GET ALL USERS
========================== */
export const getAllUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query._end) || 10;
    const users = await User.find().limit(limit).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==========================
   CREATE USER (ADMIN / DEFAULT)
========================== */
export const createUser = async (req, res) => {
  try {
    const { name, email, avatar, password } = req.body;

    const finalEmail = (email || "tafaseel.arch2025@gmail.com").trim();
    const finalPassword = password || "T@f@seel2025";

    let user = await User.findOne({ email: finalEmail });

    if (!user) {
      const hashedPassword = await bcrypt.hash(finalPassword, 10);

      user = await User.create({
        name: name || "Admin",
        email: finalEmail,
        avatar: avatar || "https://i.pravatar.cc/150?img=2",
        password: hashedPassword,
      });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==========================
   GET USER BY ID
========================== */
export const getUserInfoByID = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==========================
   UPDATE USER
========================== */
export const updateUser = async (req, res) => {
  try {
    const { name, email, avatar, password } = req.body;
    const updateData = { name, email };

    if (avatar?.startsWith("data:image")) {
      const upload = await cloudinary.v2.uploader.upload(avatar, {
        folder: "avatars",
      });
      updateData.avatar = upload.secure_url;
    } else if (avatar) {
      updateData.avatar = avatar;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==========================
   LOGIN USER (JWT + COOKIE)
========================== */
export const loginUser = async (req, res) => {
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const user = await User.findOne({ email });
  if (!user)
    return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  });
};

/* ==========================
   LOGOUT
========================== */
export const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ message: "Logged out" });
};