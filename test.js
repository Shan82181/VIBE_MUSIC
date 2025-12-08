router.get('/proxy/:id', async (req, res) => {
  try {
    // Force ANDROID client for playback to avoid signatureCipher issues
    const client = 'ANDROID';
    const urls = await getStreamingUrls(req.params.id, client);
    const best = urls.find(u => u.mimeType && u.mimeType.includes('audio/mp4')) 
              || urls.find(u => u.mimeType && u.mimeType.includes('audio/webm'))
              || urls.find(u => u.mimeType && u.mimeType.includes('audio'))
              || urls[0];
    if (!best) return res.status(404).json({ error: 'No stream' });
    console.log(`Proxying stream for ${req.params.id} - ${best.url}`);
    // Android-like headers for CDN
    const headers = {
      'User-Agent': 'com.google.android.youtube/19.50.37 (Linux; U; Android 14) gzip',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'Origin': 'https://www.youtube.com',
      'Referer': 'https://www.youtube.com/',
      'x-origin': 'https://www.youtube.com',
      'Range': req.headers['range'] || 'bytes=0-',
    };

    const response = await axios.get(best.url, {
      responseType: 'stream',
      headers,
      validateStatus: () => true
    });

    if (response.status >= 400) {
      console.error('CDN rejected', response.status, response.statusText);
      return res.status(response.status).json({ error: 'YouTube CDN refused the request', status: response.status });
    }

    if (response.headers['content-length']) res.setHeader('Content-Length', response.headers['content-length']);
    if (response.headers['accept-ranges']) res.setHeader('Accept-Ranges', response.headers['accept-ranges']);
    if (response.headers['content-range']) res.setHeader('Content-Range', response.headers['content-range']);
    res.setHeader('Content-Type', best.mimeType || 'audio/mpeg');

    response.data.pipe(res);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: 'Proxy failed', detail: err.message });
  }
});