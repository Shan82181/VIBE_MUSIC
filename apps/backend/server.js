//<-- Import modules -->
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware , getAuth ,requireAuth} from "@clerk/express";
import bodyParser from 'body-parser';


//<-- import routes -->
import connectDB from "./src/lib/db.js";
import authRoutes from "./src/routes/auth.route.js";
//import adminRoutes from "./src/routes/admin.route.js";
//import musicRoutes from "./src/routes/music.route.js";
//import likedSongRoutes from "./src/routes/likedsong.route.js";
//import playlistRoutes from "./src/routes/playlist.route.js";
import userRoutes from "./src/routes/user.routes.js";
import apiRoutes from './src/routes/api.js';
import syncUser from './src/routes/syncUser.js';
import HomePageData from './src/routes/homePage.route.js';
import ExplorePageData from './src/routes/explorePage.route.js';
import BrowsePageData from './src/routes/browsePage.route.js';
//import { getQuickPicks } from './src/services/innertubeService.js';
//<-- App config -->
dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(clerkMiddleware());

//<-- API Endpoints -->
app.use("/api/auth", authRoutes);
// app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
//app.use("/api/music", musicRoutes);
//app.use("/api/liked-songs", likedSongRoutes);
//app.use("/api/playlists", playlistRoutes);
//app.use("/api/music", musicRoutes);
app.use('/api',requireAuth(), apiRoutes);
app.use('/api', syncUser);
app.use('/api', requireAuth(), HomePageData);
app.use('/api', requireAuth(), ExplorePageData);
app.use('/api', requireAuth(), BrowsePageData);









//<-  Start the server -->
const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server is running on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB:", err);
  });
