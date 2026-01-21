import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import RecentlyPlayed from "./models/RecentlyPlayed.js"; // ✅ ADD THIS LINE
import User from "./models/user.js";
import audioRoute from "./routes/audioRoute.js";
import authRoutes from "./routes/authRoutes.js";
import recommendRoutes from "./routes/recommendRoute.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/", authRoutes);
app.use("/recommend", recommendRoutes);
app.use("/api/audio", audioRoute);

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

// ✅ Signup Route
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== RECENTLY PLAYED ROUTES ====================
// ✅ ADD THESE TWO ROUTES BELOW

// Get recently played songs for a user
app.get('/api/recently-played/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`📊 Fetching recently played for user: ${userId}`);

    // Fetch from database
    const recentlyPlayed = await RecentlyPlayed.find({ userId })
      .sort({ playedAt: -1 })
      .limit(20);

    console.log(`✅ Found ${recentlyPlayed.length} recently played songs`);

    res.json({ 
      success: true, 
      songs: recentlyPlayed 
    });
  } catch (error) {
    console.error('❌ Error fetching recently played:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Save a recently played song
app.post('/api/recently-played', async (req, res) => {
  try {
    const { userId, song } = req.body;

    console.log(`💾 Saving recently played for user: ${userId}`);
    console.log(`🎵 Song: ${song.title}`);

    if (!userId || !song || !song.filename) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Remove if already exists (to update playedAt)
    await RecentlyPlayed.deleteOne({ 
      userId, 
      filename: song.filename 
    });

    // Add new entry
    const newEntry = new RecentlyPlayed({
      userId,
      filename: song.filename,
      title: song.title,
      artist: song.artist || 'Unknown Artist',
      language: song.language,
      emotion: song.emotion,
      source: song.source || 'manual',
      playedAt: new Date(),
    });

    await newEntry.save();

    console.log('✅ Recently played saved successfully');

    // Keep only last 20 songs for this user
    const allSongs = await RecentlyPlayed.find({ userId })
      .sort({ playedAt: -1 });
    
    if (allSongs.length > 20) {
      const songsToDelete = allSongs.slice(20);
      const idsToDelete = songsToDelete.map(s => s._id);
      await RecentlyPlayed.deleteMany({ _id: { $in: idsToDelete } });
      console.log(`🧹 Cleaned up ${songsToDelete.length} old songs`);
    }

    res.json({ 
      success: true,
      message: 'Recently played saved' 
    });
  } catch (error) {
    console.error('❌ Error saving recently played:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ==================== END RECENTLY PLAYED ROUTES ====================

// ✅ Default route
app.get("/", (req, res) => {
  res.send("AatmaBeat Backend is running 🎶");
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));