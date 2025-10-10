import mongoose from "mongoose";

const SongSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  title: { type: String, required: true },
  artists: [String],
  thumbnail: String,
  duration: String,
  albumId: String,
  albumName: String
});

const PlaylistSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Clerk user
    name: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
    songs: [SongSchema],
    isPublic: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Playlist", PlaylistSchema);
