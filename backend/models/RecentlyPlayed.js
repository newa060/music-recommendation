// backend/models/RecentlyPlayed.js
import mongoose from 'mongoose';

const recentlyPlayedSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  filename: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    default: 'Unknown Artist',
  },
  language: {
    type: String,
    default: 'Unknown',
  },
  emotion: {
    type: String,
    default: null,
  },
  source: {
    type: String,
    enum: ['manual', 'face-detection', 'test'],
    default: 'manual',
  },
  playedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for efficient queries
recentlyPlayedSchema.index({ userId: 1, playedAt: -1 });

// Compound unique index to prevent duplicate entries
recentlyPlayedSchema.index({ userId: 1, filename: 1 });

export default mongoose.model('RecentlyPlayed', recentlyPlayedSchema);