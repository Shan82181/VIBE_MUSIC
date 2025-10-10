import Playlist from "../models/playlist.model.js";

export const createPlaylist = async (req, res) => {
  try {
    const playlist = new Playlist({ userId: req.user.sub, ...req.body });
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.sub });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addSongToPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.playlistId, userId: req.user.sub });
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    playlist.songs.push(req.body);
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeSongFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.playlistId, userId: req.user.sub });
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    playlist.songs = playlist.songs.filter(song => song._id.toString() !== req.params.songId);
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    await Playlist.findOneAndDelete({ _id: req.params.playlistId, userId: req.user.sub });
    res.json({ message: "Playlist deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
