import mongoose from "mongoose";

const LikedSongSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    videoId: { type: String, required: true },
    title: String,
    thumbnail: String,
    duration: String,
    artist: String
  },
  { timestamps: true }
);

export default mongoose.model("LikedSong", LikedSongSchema);
