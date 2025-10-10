// Music search/stream endpoints (youtubei.js) - protected
import express from "express";
import {
  verifyClerkJWT,
  attachUser,
} from "../middlewares/auth.middleware.js";
import {
  searchSongs,
  //getStream,
} from "../controllers/music.controller.js";
import { proxyStream } from "../controllers/music.proxy.controller.js";
const router = express.Router();

// Search songs: /api/music/search?query=...
router.get("/search",  searchSongs); //verifyClerkJWT, attachUser,

// Get a playable audio URL for a videoId
//router.get("/stream/:videoId",  getStream);//verifyClerkJWT, attachUser,

router.get("/proxy/:videoId", proxyStream);
// Get album details (if available)
//router.get("/album/:albumId", verifyClerkJWT, attachUser, getAlbum);

export default router;
