import express from 'express';
import axios from 'axios';
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
router.get('/proxy/:id', async (req, res) => {
  try {
    const videoId = req.params.id;

    // Get YouTube streaming URLs from your existing service
    const urls = await getStreamingUrls(videoId);
    console.log(`Streaming URLs for ${videoId}:`, urls);
    const audioUrl = urls.find(u => u.mimeType?.includes('audio/mp4') || u.mimeType?.includes('audio/webm'))?.url ||
                     urls.find(u => u.mimeType?.includes('audio'))?.url;  // Fallback to any audio
    if (!audioUrl) {
      console.error(`No audio stream found for ${videoId}`);
      return res.status(404).json({ error: "No audio stream found" });
    }

    // Construct Worker proxy URL with optional API key
    let workerProxyUrl = `${WORKER_URL}?url=${encodeURIComponent(audioUrl)}`;
    if (WORKER_API_KEY) workerProxyUrl += `&key=${WORKER_API_KEY}`;

    // Proxy the audio via Cloudflare Worker
    const response = await axios({
      url: workerProxyUrl,
      method: "GET",
      responseType: "stream",
      headers: {
        Range: req.headers.range || "bytes=0-",  // Forward range for seeking
      },
      timeout: 10000,  // Add timeout to avoid hanging
    });

    // Forward headers dynamically for proper audio playback
    const contentType = response.headers["content-type"] || "audio/mpeg";  // Forward or default
    res.setHeader("Content-Type", contentType);
    if (response.headers["content-length"]) res.setHeader("Content-Length", response.headers["content-length"]);
    if (response.headers["accept-ranges"]) res.setHeader("Accept-Ranges", response.headers["accept-ranges"]);
    if (response.headers["content-range"]) res.setHeader("Content-Range", response.headers["content-range"]);

    // Optional: Add CORS if needed (though Worker handles it)
    res.setHeader("Access-Control-Allow-Origin", "*");  // Or restrict to your frontend

    // Pipe audio stream to frontend
    response.data.pipe(res);

  } catch (err) {
    console.error("Proxy error:", err.message || err);
    // Differentiate errors
    if (err.code === 'ECONNABORTED') {
      res.status(504).json({ error: "Request timeout", detail: err.message });
    } else if (err.response) {
      res.status(err.response.status).json({ error: "Worker error", detail: err.response.data });
    } else {
      res.status(500).json({ error: "Proxy failed", detail: err.message || String(err) });
    }
  }
});


export default router;
