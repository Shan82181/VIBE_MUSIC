import express from "express";
import LikedSong from "../model/likedSongs.model.js";

const router = express.Router();

router.post("/liked", async (req, res) => {
  try {
    const { userId, videoId, title, thumbnail , duration , artist} = req.body;
    // Like (add new record)
    const newLike = new LikedSong({
      userId,
      videoId,
      title,
      thumbnail,
      duration,
      artist
    });

    await newLike.save();
    res.json({ liked: true, song: newLike });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/unliked", async (req, res) => {
  try {
    const { userId, videoId } = req.body;
    const deleted = await LikedSong.findOneAndDelete({ userId, videoId });
    if (deleted) {
      res.json({ liked: false, song: deleted });
    } else {
      res.status(404).json({ message: "Liked song not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const likedSongs = await LikedSong.find({ userId });
    res.json({ likedSongs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
