import axios from "axios";

const SEARCH_URL = "https://youtubei.googleapis.com/youtubei/v1/search";
const API_KEY = "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30";

const clients = [
  {
    clientName: "WEB_REMIX",
    clientVersion: "1.20240920.09.00",
    platform: "DESKTOP",
    hl: "en",
    gl: "US",
    origin: "https://music.youtube.com"
  },
  {
    clientName: "ANDROID",
    clientVersion: "17.31.35",
    androidSdkVersion: 30,
    userAgent:
      "com.google.android.youtube/17.31.35 (Linux; U; Android 11) gzip",
    origin: "https://www.youtube.com"
  },
  {
    clientName: "WEB",
    clientVersion: "2.20240920.09.00",
    hl: "en",
    gl: "US",
    origin: "https://www.youtube.com"
  }
];

export const searchSongs = async (req, res) => {
  try {
    const q = req.query.query;
    if (!q) return res.status(400).json({ error: "query required" });

    let results = [];

    for (const client of clients) {
      try {
        const payload = {
          context: { client },
          query: q
        };

        const resp = await axios.post(
          `${SEARCH_URL}?key=${API_KEY}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Origin: client.origin,
              "x-origin": client.origin
            },
            timeout: 10000
          }
        );

        const items =
          resp.data?.contents?.sectionListRenderer?.contents?.[0]
            ?.musicShelfRenderer?.contents || [];

        for (const it of items) {
          try {
            const mr =
              it.musicResponsiveListItemRenderer ||
              it.musicTwoRowItemRenderer ||
              it;
            const title =
              mr?.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer
                ?.text?.runs?.[0]?.text || mr?.title?.runs?.[0]?.text;
            const videoId =
              mr?.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer
                ?.text?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId ||
              mr?.navigationEndpoint?.watchEndpoint?.videoId;
            const thumbnail =
              mr?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
                ?.slice(-1)?.[0]?.url;
            const artists =
              mr?.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer
                ?.text?.runs?.map((r) => r.text) || [];
            const duration =
              mr?.fixedColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer
                ?.text?.runs?.[0]?.text;

            if (videoId) {
              results.push({ videoId, title, artists, thumbnail, duration });
            }
          } catch {}
        }

        if (results.length > 0) break; // ✅ stop if one client works
      } catch (err) {
        console.warn(`[SEARCH] ${client.clientName} failed:`, err.message);
      }
    }

    if (results.length === 0) {
      return res.status(500).json({ error: "no results found" });
    }

    res.json(results);
  } catch (err) {
    console.error("searchSongs fatal:", err.message);
    res.status(500).json({ error: "search failed" });
  }
};
