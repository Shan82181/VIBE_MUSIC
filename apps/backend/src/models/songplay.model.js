import mongoose from "mongoose";

const SongPlaySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  videoId: { type: String, required: true },
  playedAt: { type: Date, default: Date.now }
});

export default mongoose.model("SongPlay", SongPlaySchema);
