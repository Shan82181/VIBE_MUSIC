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
router.options('/proxy/:id', (req, res) => {
  // Allow specific origin in production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Range, User-Agent, Accept, Origin, Referer');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.status(200).end();
});

router.head('/proxy/:id', async (req, res) => {
  // Minimal HEAD handler to let players probe meta without streaming body
  try {
    const id = req.params.id;
    const client = 'WEB';
    const urls = await getStreamingUrls(id, client); // your function
    const best = urls.find(u => u.mimeType?.includes('audio/mp4'))
              || urls.find(u => u.mimeType?.includes('audio/webm'))
              || urls[0];
    if (!best) return res.sendStatus(404);

    const headers = {
      'User-Agent': 'com.google.android.youtube/19.50.37 (Linux; U; Android 14) gzip',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'Origin': 'https://www.youtube.com',
      'Referer': 'https://www.youtube.com/',
      'x-origin': 'https://www.youtube.com',
      'Range': req.headers['range'] || 'bytes=0-',
    };

    const upstream = await axios.get(best.url, { method: 'GET', headers, responseType: 'stream', validateStatus: ()=>true });
    if (upstream.status >= 400) return res.status(upstream.status).end();

    // Propagate relevant headers
    const propagate = ['content-length','accept-ranges','content-range','content-type'];
    propagate.forEach(h => {
      if (upstream.headers[h]) res.setHeader(h, upstream.headers[h]);
    });

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Accept-Ranges, Content-Range');
    // No body for HEAD
    res.status(upstream.status === 206 ? 206 : 200).end();

    // destroy upstream stream (we only probed headers)
    upstream.data?.destroy?.();
  } catch (err) {
    console.error('HEAD proxy error', err);
    res.status(500).end();
  }
});

router.get('/proxy/:id', async (req, res) => {
  let upstream;
  try {
    const id = req.params.id;
    // validate id format to prevent abuse
    if (!id || typeof id !== 'string' || id.length > 200) return res.status(400).json({ error: 'bad id' });

    const client = 'ANDROID';
    const urls = await getStreamingUrls(id, client);
    const best = urls.find(u => u.mimeType?.includes('audio/mp4'))
              || urls.find(u => u.mimeType?.includes('audio/webm'))
              || urls[0];
    if (!best) return res.status(404).json({ error: 'No stream' });

    console.log(`Proxying stream for ${id} -> ${best.url}`);

    const headers = {
      'User-Agent': 'com.google.android.youtube/19.50.37 (Linux; U; Android 14) gzip',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'Origin': 'https://www.youtube.com',
      'Referer': 'https://www.youtube.com/',
      'x-origin': 'https://www.youtube.com',
      'Range': req.headers['range'] || 'bytes=0-',
    };

    upstream = await axios.get(best.url, {
      responseType: 'stream',
      headers,
      validateStatus: () => true,
      // consider timeout: 15000
    });

    if (upstream.status >= 400) {
      console.error('CDN rejected', upstream.status, upstream.statusText);
      return res.status(upstream.status).json({ error: 'YouTube CDN refused the request', status: upstream.status });
    }

    // CORS & expose
    res.setHeader('Access-Control-Allow-Origin', '*'); // restrict in prod
    res.setHeader('Access-Control-Allow-Headers', 'Range, User-Agent, Accept, Origin, Referer');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Accept-Ranges, Content-Range');

    // Forward useful headers from upstream
    if (upstream.headers['content-length']) res.setHeader('Content-Length', upstream.headers['content-length']);
    if (upstream.headers['accept-ranges']) res.setHeader('Accept-Ranges', upstream.headers['accept-ranges']);
    if (upstream.headers['content-range']) res.setHeader('Content-Range', upstream.headers['content-range']);
    res.setHeader('Content-Type', best.mimeType || upstream.headers['content-type'] || 'audio/mpeg');

    // Set status code same as upstream so browser handles seeking (206 or 200)
    res.status(upstream.status === 206 ? 206 : 200);

    // If client disconnects, destroy upstream to free resources
    const cleanup = () => {
      try { upstream.data?.destroy?.(); } catch (e) {}
    };
    req.on('close', cleanup);

    // Pipe upstream to client
    upstream.data.pipe(res);

    // handle upstream stream errors
    upstream.data.on('error', (streamErr) => {
      console.error('Upstream stream error', streamErr);
      try { res.destroy(streamErr); } catch(e) {}
    });

  } catch (err) {
    console.error('Proxy error:', err?.message || err);
    if (!res.headersSent) res.status(500).json({ error: 'Proxy failed', detail: err.message || String(err) });
    upstream?.data?.destroy?.();
  }
});


export default router;
