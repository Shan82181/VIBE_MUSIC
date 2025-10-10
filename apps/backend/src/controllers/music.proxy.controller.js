// src/controllers/music.proxy.controller.js
import axios from "axios";
import { getStreamingUrl } from "../lib/innertube.js";

/**
 * proxyStream - streams audio through your server
 * GET /api/music/proxy/:videoId
 */
export const proxyStream = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    if (!videoId) return res.status(400).json({ error: "videoId required" });

    const info = await getStreamingUrl(videoId);
    const url = info.url;
    if (!url) return res.status(404).json({ error: "No playable URL" });

    // request upstream with Range support
    const upstreamResp = await axios.get(url, {
      responseType: "stream",
      headers: { Range: req.headers.range || "" },
      validateStatus: s => s >= 200 && s < 500,
      timeout: 20000
    });

    // basic validation: ensure upstream isn't an HTML error
    const ctype = (upstreamResp.headers["content-type"] || "").toLowerCase();
    if (!(ctype.includes("audio/") || ctype.includes("video/") || ctype.includes("application/octet-stream"))) {
      // read small chunk and check
      upstreamResp.data.destroy();
      return res.status(502).json({ error: "Upstream did not return audio" });
    }

    if (upstreamResp.headers["content-length"]) res.setHeader("Content-Length", upstreamResp.headers["content-length"]);
    if (upstreamResp.headers["content-type"]) res.setHeader("Content-Type", upstreamResp.headers["content-type"]);
    if (upstreamResp.headers["accept-ranges"]) res.setHeader("Accept-Ranges", upstreamResp.headers["accept-ranges"]);

    res.status(upstreamResp.status);
    upstreamResp.data.pipe(res);
  } catch (err) {
    console.error("proxyStream error:", err?.message || err);
    if (!res.headersSent) {
      res.status(500).json({ error: err?.message || "Internal server error" });
    }
  }
};
