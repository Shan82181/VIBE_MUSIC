// Playlist CRUD + add/remove songs (user-owned)
import express from "express";
import { verifyClerkJWT, attachUser } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  getUserPlaylists,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist
} from "../controllers/playlist.controller.js";

const router = express.Router();

// Create playlist
router.post("/", verifyClerkJWT, attachUser, createPlaylist);

// Get playlists for current user
router.get("/", verifyClerkJWT, attachUser, getUserPlaylists);

// Add a song to a playlist (body: song metadata)
router.post("/:playlistId/songs", verifyClerkJWT, attachUser, addSongToPlaylist);

// Remove a song from a playlist
router.delete("/:playlistId/songs/:songId", verifyClerkJWT, attachUser, removeSongFromPlaylist);

// Delete a playlist
router.delete("/:playlistId", verifyClerkJWT, attachUser, deletePlaylist);

export default router;
