import mongoose from 'mongoose';

const TrackSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  title: String,
  artist: String,
  duration: Number,
  thumbnail: String,
  cachedAt: { type: Date, default: Date.now }
});

// ❌ You had model creation *after* export
// ❌ If you reload the server, Mongoose will complain about "Cannot overwrite `Track` model once compiled"

const Track = mongoose.models.Track || mongoose.model("Track", TrackSchema);

export default Track;
