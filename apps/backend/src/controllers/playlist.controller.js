// controllers/playlist.controller.js
import Playlist from "../models/playlist.model.js";

/* 🎵 CREATE PLAYLIST */
export const createPlaylist = async (req, res) => {
  try {
    const { userId, name, description, coverImage, isPublic } = req.body;

    if (!userId || !name)
      return res.status(400).json({ message: "User ID and name are required" });

    const playlist = new Playlist({
      userId,
      name,
      description,
      coverImage,
      isPublic,
      songs: [],
    });

    await playlist.save();
    res.status(201).json(playlist);
  } catch (error) {
    console.error("❌ Error creating playlist:", error);
    res.status(500).json({ message: "Failed to create playlist" });
  }
};

/* 🎶 ADD SONG TO PLAYLIST */
/* 🎶 ADD SONG TO PLAYLIST */
export const addSongToPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { song } = req.body; 

    if (!song || !song.videoId)
      return res.status(400).json({ message: "Invalid song data" });

    const playlist = await Playlist.findById(id);
    if (!playlist) 
      return res.status(404).json({ message: "Playlist not found" });

    const exists = playlist.songs.some(s => s.videoId === song.videoId);

    if (exists)
      return res.status(409).json({ message: "Song already in playlist" });

    playlist.songs.push(song);
    await playlist.save();

    res.status(200).json(playlist);

  } catch (error) {
    console.error("❌ Error adding song:", error);
    res.status(500).json({ message: "Failed to add song to playlist" });
  }
};


/* ❌ REMOVE SONG FROM PLAYLIST */
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { id, videoId } = req.params;

    const playlist = await Playlist.findById(id);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    playlist.songs = playlist.songs.filter(song => song.videoId !== videoId);
    await playlist.save();

    res.status(200).json(playlist);
  } catch (error) {
    console.error("❌ Error removing song:", error);
    res.status(500).json({ message: "Failed to remove song from playlist" });
  }
};

/* 📚 GET USER PLAYLISTS */
export const getUserPlaylists = async (req, res) => {
  try {
    const { userId } = req.params;
    const playlists = await Playlist.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(playlists);
  } catch (error) {
    console.error("❌ Error fetching playlists:", error);
    res.status(500).json({ message: "Failed to fetch playlists" });
  }
};

/* 🗑️ DELETE A PLAYLIST */
export const deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await Playlist.findById(id);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    await Playlist.findByIdAndDelete(id);
    res.status(200).json({ message: "Playlist deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting playlist:", error);
    res.status(500).json({ message: "Failed to delete playlist" });
  }
};
