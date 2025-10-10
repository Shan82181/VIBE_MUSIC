// Liked songs (separate collection) - scalable
import express from "express";
import { verifyClerkJWT, attachUser } from "../middlewares/auth.middleware.js";
import { likeSong, getLikedSongs, unlikeSong } from "../controllers/likedsong.controller.js";

const router = express.Router();

// Like a song (creates a LikedSong doc)
router.post("/", verifyClerkJWT, attachUser, likeSong);

// Fetch liked songs for current user
router.get("/", verifyClerkJWT, attachUser, getLikedSongs);

// Unlike (delete) a song by videoId
router.delete("/:videoId", verifyClerkJWT, attachUser, unlikeSong);

export default router;
