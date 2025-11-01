import express from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";

const router = express.Router();

// 🧩 SIGNUP route
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 🧠 SIGNIN route
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

   res.status(200).json({
  message: "Login successful",
  user: {
    id: user._id,
    email: user.email,
    name: user.name || "User",
  },
});


  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 📝 UPDATE USER PROFILE
router.put("/update/:id", async (req, res) => {
  try {
    const { name, bio } = req.body;
    const userId = req.params.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, bio },
      { new: true } // returns updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


export default router;