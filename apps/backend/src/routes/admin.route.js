// Admin dashboard routes: users + analytics + delete user
import express from "express";
import { verifyClerkJWT, attachUser } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../../src/middlewares/admin.middleware.js";
import { getAllUsers, deleteUser, getMostLikedSongs, getMostPlayedSongs, getTopPlaylists } from "../controllers/admin.controller.js";

const router = express.Router();

// User management
router.get("/users", verifyClerkJWT, attachUser, verifyAdmin, getAllUsers);
router.delete("/users/:userId", verifyClerkJWT, attachUser, verifyAdmin, deleteUser);

// Analytics
router.get("/analytics/liked-songs", verifyClerkJWT, attachUser, verifyAdmin, getMostLikedSongs);
router.get("/analytics/played-songs", verifyClerkJWT, attachUser, verifyAdmin, getMostPlayedSongs);
router.get("/analytics/playlists", verifyClerkJWT, attachUser, verifyAdmin, getTopPlaylists);

export default router;
