import User from "../mongodb/models/user.js";
import cloudinary from "cloudinary";


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
 const createUser = async (req, res) => {
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



// server/controllers/user.controller.js



const loginUser = async (req, res) => {
  console.log("Login request body:", req.body); // log full request

  const email = req.body.email?.toString().trim();
  const password = req.body.password?.toString().trim();

  console.log("Request email:", JSON.stringify(email));
  console.log("Request password:", JSON.stringify(password));

  try {
    const user = await User.findOne({ email });
    console.log("User from DB:", user);
    console.log("User password from DB:", JSON.stringify(user?.password));

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const savedPassword = user.password?.toString().trim();
    if (savedPassword !== password) {
      console.log("Password mismatch detected!");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("Login successful for:", email);
    res.status(200).json({ user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export { getAllUsers, createUser, getUserInfoByID, updateUser, loginUser };
