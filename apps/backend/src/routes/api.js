import express from 'express';
import axios from 'axios';
import fetch from "node-fetch";
import { searchTracks, getTrackMetadata, getStreamingUrls } from '../services/innertubeService.js';

const router = express.Router();
import { requireAuth } from '@clerk/express';
// 🔒 Protect all routes under /api with Clerk
//router.use(requireAuth());

router.get('/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'Missing query param ?q=' });
    const results = await searchTracks(q);
    res.json(results);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/metadata/:id', async (req, res) => {
  try {
    const data = await getTrackMetadata(req.params.id);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) {
    console.error('Metadata error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/stream/:id', async (req, res) => {
  try {
    // stream info (raw urls)
    const urls = await getStreamingUrls(req.params.id);
    res.json(urls);
  } catch (err) {
    console.error('Stream error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Proxy route: streams audio through backend to avoid CDN Access Denied
// At the top, configure your Worker URL (use env var for flexibility)
const WORKER_URL = process.env.WORKER_URL || "https://vibemusic.shantanupal229.workers.dev"; // Fallback to your URL
const WORKER_API_KEY = process.env.WORKER_API_KEY; // Optional: Add for security (e.g., ?key=your-key)

// Existing router


router.get("/proxy/:id", async (req, res) => {
  try {
    const videoId = req.params.id;

    // 1. Get streaming URLs
    const urls = await getStreamingUrls(videoId);
    const audioUrl =
      urls.find(u =>
        u.mimeType?.includes("audio/mp4") ||
        u.mimeType?.includes("audio/webm")
      )?.url ||
      urls.find(u => u.mimeType?.includes("audio"))?.url;

    if (!audioUrl) {
      return res.status(404).json({ error: "No audio stream found" });
    }

    console.log("Proxying audio URL:", audioUrl);

    // 2. Final Worker proxy URL
    let workerUrl = `${WORKER_URL}?url=${encodeURIComponent(audioUrl)}`;
    if (WORKER_API_KEY) workerUrl += `&key=${WORKER_API_KEY}`;

    // 3. Fetch Worker output
    const workerRes = await fetch(workerUrl, {
      headers: {
        Range: req.headers.range || "bytes=0-",
      }
    });

    // If worker fails → forward status
    if (!workerRes.ok) {
      return res.status(workerRes.status).send("Worker failed");
    }

    // 4. Forward headers
    res.setHeader(
      "Content-Type",
      workerRes.headers.get("Content-Type") || "audio/mpeg"
    );

    const passHeaders = ["Content-Length", "Content-Range", "Accept-Ranges"];
    passHeaders.forEach(h => {
      const v = workerRes.headers.get(h);
      if (v) res.setHeader(h, v);
    });

    res.setHeader("Access-Control-Allow-Origin", "*");

    // 5. Stream Worker response to frontend
    workerRes.body.pipe(res);

  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy failed" });
  }
});



export default router;
