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

// CREATE or RETURN default static user

// CREATE or RETURN default static user
/*  const createUser = async (req, res) => {
  try {
    const { name, email, avatar, password } = req.body;

    const defaultUser = {
      name: (name || "Admin").trim(),
      email: (email || "tafaseel.arch2025@gmail.com").trim(),
      avatar: (avatar || "https://i.pravatar.cc/150?img=2").trim(),
      password: password ? password.trim() : "T@f@seel2025",
    };

    let user = await User.findOne({ email: defaultUser.email });

    if (!user) {
      user = await User.create(defaultUser);
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 */

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

// UPDATE user profile

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, avatar, password } = req.body;

    const updateData = { name, email };

    // Handle avatar upload to Cloudinary if it's a base64 string
    if (avatar && avatar.startsWith("data:image")) {
      const uploadedImage = await cloudinary.v2.uploader.upload(avatar, {
        folder: "avatars", // optional folder
      });
      updateData.avatar = uploadedImage.secure_url;
    } else if (avatar) {
      // If avatar is already a URL, just save it
      updateData.avatar = avatar;
    }

    // Include password if provided
    if (password && password.trim() !== "") {
      updateData.password = password.trim(); // consider hashing if using plaintext
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};





// LOGIN USER
// CREATE OR GET DEFAULT USER (hashed password)
const createUser = async (req, res) => {
  try {
    const { name, email, avatar, password } = req.body;

    const defaultUser = {
      name: (name || "Admin").trim(),
      email: (email || "tafaseel.arch2025@gmail.com").trim(),
      avatar: (avatar || "https://i.pravatar.cc/150?img=2").trim(),
      password: password ? password.trim() : "T@f@seel2025",
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(defaultUser.password, 10);

    let user = await User.findOne({ email: defaultUser.email });

    if (!user) {
      user = await User.create({ ...defaultUser, password: hashedPassword });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: error.message });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
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

// CHANGE PASSWORD (requires old password for verification)
const changePassword = async (req, res) => {
  console.log("🎉 changePassword route HIT!");
  try {
    const { id } = req.params;           // user ID from URL
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    // Find user with password field
    const user = await User.findById(id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current (old) password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update only the password field
    await User.findByIdAndUpdate(id, { password: hashedNewPassword }, { new: true });

    // Optionally: you could invalidate all existing tokens here (advanced)
    // For simplicity, we just let old tokens expire naturally

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};




export { getAllUsers, createUser, getUserInfoByID, updateUser, loginUser , changePassword};
