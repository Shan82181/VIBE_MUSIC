import axios from 'axios';
import{ JsDecipher } from './jsDecipher.js';

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://youtubei.googleapis.com/youtubei/v1';

const decipher = new JsDecipher(); // kept as fallback but not used for ANDROID

function getContext(clientName = 'WEB_REMIX') {
  const clients = {
    ANDROID: { clientName: 'ANDROID', clientVersion: '19.50.37', platform: 'MOBILE' },
    WEB_REMIX: { clientName: 'WEB_REMIX', clientVersion: '1.20241211.07.00', platform: 'DESKTOP' },
    TV_EMBEDDED: { clientName: 'TVHTML5_SIMPLY_EMBEDDED_PLAYER', clientVersion: '2.0', platform: 'TV' },
    IOS: { clientName: 'IOS', clientVersion: '19.50.7', platform: 'MOBILE' },
    WEB: { clientName: 'WEB', clientVersion: '2.20241211.07.00', platform: 'DESKTOP' }
  };
  return { client: { ...(clients[clientName] || clients['WEB_REMIX']), hl: 'en', gl: 'US' } };
}

export async function searchTracks(query) {
  const res = await axios.post(
    `${BASE_URL}/search?key=${API_KEY}`,
    { context: getContext('WEB_REMIX'), query, params: 'EgWKAQIIAWoKEAoQAxAEEAMQBA%3D%3D' },
    { headers: { 'Content-Type': 'application/json' } }
  );
  const contents = res.data?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
  const results = [];
  for (const section of contents) {
    const items = section?.musicShelfRenderer?.contents || [];
    for (const item of items) {
      const renderer = item.musicResponsiveListItemRenderer;
      if (!renderer) continue;
      const title = renderer.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
      const artist = renderer.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
      const videoId = renderer?.playlistItemData?.videoId || renderer?.navigationEndpoint?.watchEndpoint?.videoId;
      if (videoId && title && artist) {
        results.push({ videoId, title, artist, thumbnail: renderer?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url });
      }
    }
  }
  return results;
}

export async function getTrackMetadata(videoId) {
  const res = await axios.post(
    `${BASE_URL}/player?key=${API_KEY}`,
    { context: getContext('WEB_REMIX'), videoId },
    { headers: { 'Content-Type': 'application/json' } }
  );
  const details = res.data?.videoDetails;
  if (!details) return null;
  return { title: details.title, artist: details.author, duration: parseInt(details.lengthSeconds) || 0, thumbnails: details.thumbnail?.thumbnails || [], description: details.shortDescription || '' };
}

// Use ANDROID client for playback to avoid signatureCipher
export async function getStreamingUrls(videoId, clientType = 'ANDROID') {
  const res = await axios.post(
    `${BASE_URL}/player?key=${API_KEY}`,
    { context: getContext(clientType), videoId },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const data = res.data;
  const streamingData = data?.streamingData;
  if (!streamingData) throw new Error('No streaming data available');

  const urls = [];
  for (const fmt of streamingData.adaptiveFormats || []) {
    if (fmt.mimeType && fmt.mimeType.includes('audio')) {
      if (fmt.url) {
        urls.push({ url: fmt.url, mimeType: fmt.mimeType });
      } else if (fmt.signatureCipher || fmt.cipher) {
        // fallback: attempt decipher only if necessary
        const raw = fmt.signatureCipher || fmt.cipher;
        const params = new URLSearchParams(raw);
        const url = params.get('url');
        const s = params.get('s');
        const sp = params.get('sp') || 'sig';
        if (s) {
          if (!decipher.ready) {
            // try to fetch player JS from watch page
            const watch = await axios.get(`https://www.youtube.com/watch?v=${videoId}`);
            const m1 = watch.data.match(/"jsUrl":"([^"]+)"/);
            const m2 = watch.data.match(/\/s\/player\/[A-Za-z0-9_\-]+\/base\.js/);
            let jsUrl = m1 ? m1[1] : (m2 ? ('https://www.youtube.com' + m2[0]) : null);
            if (jsUrl) {
              const jsResp = await axios.get(jsUrl);
              decipher.prepareFromSource(jsResp.data);
            }
          }
          if (decipher.ready) {
            const sig = await decipher.decipher(s);
            urls.push({ url: `${url}&${sp}=${encodeURIComponent(sig)}`, mimeType: fmt.mimeType });
          }
        }
      }
    }
  }
  return urls;
}

// export  { searchTracks, getTrackMetadata, getStreamingUrls };
// 📄 Utility — Generic browse function
// 📄 Utility — Generic browse function (updated with working client)
async function browse(browseId) {
  const remixContext = {
    client: {
      clientName: "WEB_REMIX",
      clientVersion: "1.20251010.01.00", // use the version you saw in DevTools
      hl: "en",
      gl: "US",
    }
  };

  try {
    const res = await axios.post(
      `${BASE_URL}/browse?key=${API_KEY}`,
      { context: remixContext, browseId },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (err) {
    console.error('Innertube browse error:', err.response?.data || err.message);
    throw err;
  }
}

function parseTwoColumnBrowseResultsRenderer(data) {
  const root = data?.contents?.twoColumnBrowseResultsRenderer;
  if (!root) return null;

  const header = root?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer
    ?.contents?.find(c => c.musicResponsiveHeaderRenderer)?.musicResponsiveHeaderRenderer;

  const title = header?.title?.runs?.[0]?.text || '';
  const thumbnails = header?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];

  const shelf = root?.secondaryContents?.sectionListRenderer?.content?.[0]?.musicPlaylistShelfRenderer;
  const playlistId = shelf?.playlistId;
  const songs = [];

  for (const item of shelf?.contents || []) {
    const r = item.musicResponsiveListItemRenderer;
    if (!r) continue;

    const thumb = r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.at(-1)?.url;
    const videoId = r?.playlistItemData?.videoId;
    const name = r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
    const artist = r.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.map(r => r.text).join('') || '';

    songs.push({ title: name, artist, videoId, thumbnail: thumb });
  }

  return { type: 'playlist', title, thumbnails, playlistId, songs };
}

function parseSingleColumnBrowseResultsRenderer(data) {
  const root = data?.contents?.singleColumnBrowseResultsRenderer;
  if (!root) return null;

  const sections = [];
  const sectionList = root?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

  for (const section of sectionList) {
    if (section.musicCarouselShelfRenderer) {
      const shelf = section.musicCarouselShelfRenderer;
      const shelfTitle = shelf?.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text || '';
      const items = [];

      for (const content of shelf.contents || []) {
        if (content.musicResponsiveListItemRenderer) {
          const r = content.musicResponsiveListItemRenderer;
          const title = r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text || '';
          const videoId = r.playlistItemData?.videoId;
          const thumbnail = r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.at(-1)?.url;
          items.push({ type: 'song', title, videoId, thumbnail });
        }
        if (content.musicTwoRowItemRenderer) {
          const r = content.musicTwoRowItemRenderer;
          const title = r?.title?.runs?.[0]?.text || '';
          const browseId = r.navigationEndpoint?.browseEndpoint?.browseId || null;
          const thumbnail = r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.at(-1)?.url;
          items.push({ type: 'playlist', title, browseId, thumbnail });
        }
      }

      if (items.length) sections.push({ title: shelfTitle, items });
    }

    if (section.musicTastebuilderShelfRenderer) {
      sections.push({ type: 'tastebuilder', title: 'Tell us what you like' });
    }
  }

  return { type: 'home', sections };
}

function parseYouTubeMusic(json) {
  if (json?.contents?.twoColumnBrowseResultsRenderer) return parseTwoColumnBrowseResultsRenderer(json);
  if (json?.contents?.singleColumnBrowseResultsRenderer) return parseSingleColumnBrowseResultsRenderer(json);
  return { type: 'unknown', raw: json };
}

// ----------------------------------------
// Get Home or Playlist Data
// ----------------------------------------
export async function getHomeOrPlaylist(browseId = 'FEmusic_home') {
  const data = await browse(browseId);
  const parsed = parseYouTubeMusic(data);
  return parsed;
}

export function parseExplore(data) {
  const root = data?.contents?.singleColumnBrowseResultsRenderer;
  if (!root) return { type: "explore", sections: [] };

  const tab = root?.tabs?.[0]?.tabRenderer || root?.tabs?.[0]?.tabRenderer;
    const sectionList = tab?.content?.sectionListRenderer?.contents || [];


  const sections = [];

  for (const section of sectionList) {
    // 1️⃣ Navigation Buttons Section (gridRenderer)
    if (section.gridRenderer) {
      const buttons = [];
      for (const item of section.gridRenderer.items || []) {
        const btn = item.musicNavigationButtonRenderer;
        if (!btn) continue;

        const title = btn.buttontext?.runs?.[0]?.text || btn.buttonText?.runs?.[0]?.text || "";
        const browseId =
          btn.clickCommand?.browseEndpoint?.browseId ||
          btn.navigationEndpoint?.browseEndpoint?.browseId;

        buttons.push({ type: "button", title, browseId });
      }
      if (buttons.length)
        sections.push({ title: "Navigation", items: buttons });
    }

    // 2️⃣ Carousel Shelves (albums, moods, trending, etc.)
    if (section.musicCarouselShelfRenderer) {
      const shelf = section.musicCarouselShelfRenderer;
      const shelfTitle =
        shelf.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text || "";
      const items = [];

      for (const content of shelf.contents || []) {
        // Album / Playlist
        if (content.musicTwoRowItemRenderer) {
          const r = content.musicTwoRowItemRenderer;
          const title = r.title?.runs?.[0]?.text || "";
          const browseId = r.navigationEndpoint?.browseEndpoint?.browseId || "";
          const subtitle = r.subtitle?.runs?.map((t) => t.text).join("") || "";
          const artist = r.subtitle?.runs
            ?.map((r) => r.text)
            .filter((t) => !t.includes("•") && t.trim() !== "")
            .pop() || "";
          const thumbnail =
            r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.at(-1)?.url;

          items.push({
            type: "album",
            title,
            artist,
            browseId,
            thumbnail,
            subtitle,
          });
        }

        // Song Items (like in Trending)
        if (content.musicResponsiveListItemRenderer) {
          const r = content.musicResponsiveListItemRenderer;
          const title =
            r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text ||
            "";
          const videoId = r.playlistItemData?.videoId;
          const thumbnail =
            r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.at(-1)?.url;
          items.push({
            type: "song",
            title,
            videoId,
            thumbnail,
          });
        }

        // Moods & Genres buttons
        if (content.musicNavigationButtonRenderer) {
          const btn = content.musicNavigationButtonRenderer;
          const title = btn.buttonText?.runs?.[0]?.text || "";
          const browseId = btn.clickCommand?.browseEndpoint?.browseId;
          items.push({
            type: "category",
            title,
            browseId,
          });
        }
      }

      if (items.length) sections.push({ title: shelfTitle, items });
    }
  }

  return { type: "explore", sections };
}


export async function getExplore(browseId = 'FEmusic_explore') {
  const data = await browse(browseId);
  const parsed = parseExplore(data);
  return parsed;
}

