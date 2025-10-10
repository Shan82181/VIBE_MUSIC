import LikedSong from "../models/likedsong.model.js";

export const likeSong = async (req, res) => {
  try {
    const exists = await LikedSong.findOne({ userId: req.user.sub, videoId: req.body.videoId });
    if (exists) return res.status(400).json({ error: "Already liked" });

    const song = new LikedSong({ userId: req.user.sub, ...req.body });
    await song.save();
    res.json(song);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLikedSongs = async (req, res) => {
  try {
    const songs = await LikedSong.find({ userId: req.user.sub }).sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const unlikeSong = async (req, res) => {
  try {
    await LikedSong.findOneAndDelete({ userId: req.user.sub, videoId: req.params.videoId });
    res.json({ message: "Song unliked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
