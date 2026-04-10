import User from "../mongodb/models/user.js";
import cloudinary from "cloudinary";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// GET all users
const getAllUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query._end) || 10;
    const users = await User.find({}).limit(limit);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET user by ID
const getUserInfoByID = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// CLOUDINARY CONFIG
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, avatar, password } = req.body;

    const updateData = {
      name,
      email: email ? email.toLowerCase().trim() : undefined,
    };

    // avatar upload
    if (avatar && avatar.startsWith("data:image")) {
      const uploadedImage = await cloudinary.v2.uploader.upload(avatar, {
        folder: "avatars",
      });
      updateData.avatar = uploadedImage.secure_url;
    } else if (avatar) {
      updateData.avatar = avatar;
    }

    // FIXED: hash password instead of saving plain text
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// CREATE USER (safe version)
const createUser = async (req, res) => {
  try {
    const { name, email, avatar, password } = req.body;

    const defaultUser = {
      name: (name || "Admin").trim(),
      email: (email || "tafaseel.arch2025@gmail.com").toLowerCase().trim(),
      avatar: (avatar || "https://i.pravatar.cc/150?img=2").trim(),
      password: password ? password.trim() : "T@f@seel2025",
    };

    let user = await User.findOne({ email: defaultUser.email });

    if (!user) {
      const hashedPassword = await bcrypt.hash(defaultUser.password, 10);

      user = await User.create({
        ...defaultUser,
        password: hashedPassword,
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: error.message });
  }
};


// LOGIN USER (FIXED)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Both current and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters",
      });
    }

    const user = await User.findById(id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(id, {
      password: hashedNewPassword,
    });

    return res.status(200).json({
      message: "Password changed successfully",
    });

  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// EXPORTS
export {
  getAllUsers,
  createUser,
  getUserInfoByID,
  updateUser,
  loginUser,
  changePassword,
};