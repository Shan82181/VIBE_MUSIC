import mongoose from "mongoose";

const LikedSongSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    videoId: { type: String, required: true },
    title: String,
    artists: [String],
    thumbnail: String,
    duration: String,
    albumId: String,
    albumName: String,
    likedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("LikedSong", LikedSongSchema);
