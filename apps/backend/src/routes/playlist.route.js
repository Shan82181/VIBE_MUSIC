// routes/playlist.routes.js
import express from "express";
import {
  createPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getUserPlaylists,
  deletePlaylist,
  getSinglePlaylist
} from "../controllers/playlist.controller.js";

const router = express.Router();

router.post("/", createPlaylist);
router.post("/:id/add", addSongToPlaylist);
router.delete("/:id/remove/:videoId", removeSongFromPlaylist);
router.get("/user/:userId", getUserPlaylists);
router.get("/userplaylist/:id", getSinglePlaylist);
router.delete("/:id", deletePlaylist);

export default router;
