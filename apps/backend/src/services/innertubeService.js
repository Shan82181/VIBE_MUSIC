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
async function browse(browseId) {
  const androidMusicContext = {
    client: {
      clientName: "ANDROID_MUSIC",
      clientVersion: "5.17.52",
      androidSdkVersion: 33,
      hl: "en",
      gl: "US",
    }
  };

  const res = await axios.post(
    `${BASE_URL}/browse?key=${API_KEY}`,
    { context: androidMusicContext, browseId },
    { headers: { "Content-Type": "application/json" } }
  );

  return res.data;
}


// 🔥 Trending Songs
export async function getTrendingSongs() {
  const data = await browse('FEmusic_explore');
  const sections = data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
  const results = [];

  for (const section of sections) {
    const items = section?.musicCarouselShelfRenderer?.contents || [];
    for (const item of items) {
      const renderer = item.musicTwoRowItemRenderer;
      if (!renderer) continue;
      const videoId = renderer.navigationEndpoint?.watchEndpoint?.videoId;
      const title = renderer.title?.runs?.[0]?.text;
      const artist = renderer.subtitle?.runs?.[0]?.text;
      const thumbnail = renderer.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url;
      if (videoId && title && artist) results.push({ videoId, title, artist, thumbnail });
    }
  }
  return results;
}

// 💿 Playlists You Might Like
export async function getSuggestedPlaylists() {
  const data = await browse('FEmusic_explore');
  const sections = data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
  const results = [];

  for (const section of sections) {
    const header = section.musicCarouselShelfRenderer?.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text || '';
    if (!/playlists/i.test(header)) continue;
    const items = section.musicCarouselShelfRenderer.contents || [];
    for (const item of items) {
      const renderer = item.musicTwoRowItemRenderer;
      if (!renderer) continue;
      const playlistId = renderer.navigationEndpoint?.browseEndpoint?.browseId;
      const title = renderer.title?.runs?.[0]?.text;
      const thumbnail = renderer.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url;
      if (playlistId && title) results.push({ playlistId, title, thumbnail });
    }
  }
  return results;
}

// 🌟 Featured / New Releases
export async function getFeaturedContent() {
  const data = await browse('FEmusic_explore');
  const sections = data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
  const results = [];

  for (const section of sections) {
    const header = section.musicCarouselShelfRenderer?.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text || '';
    if (/featured|new releases/i.test(header)) {
      const items = section.musicCarouselShelfRenderer.contents || [];
      for (const item of items) {
        const renderer = item.musicTwoRowItemRenderer;
        if (!renderer) continue;
        const videoId = renderer.navigationEndpoint?.watchEndpoint?.videoId;
        const title = renderer.title?.runs?.[0]?.text;
        const artist = renderer.subtitle?.runs?.[0]?.text;
        const thumbnail = renderer.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url;
        if (videoId && title) results.push({ videoId, title, artist, thumbnail });
      }
    }
  }
  return results;
}

// 👩‍🎤 Popular Artists
export async function getPopularArtists() {
  const data = await browse('FEmusic_explore');
  const sections = data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
  const results = [];

  for (const section of sections) {
    const header = section.musicCarouselShelfRenderer?.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text || '';
    if (/artists/i.test(header)) {
      const items = section.musicCarouselShelfRenderer.contents || [];
      for (const item of items) {
        const renderer = item.musicTwoRowItemRenderer;
        if (!renderer) continue;
        const artistId = renderer.navigationEndpoint?.browseEndpoint?.browseId;
        const name = renderer.title?.runs?.[0]?.text;
        const thumbnail = renderer.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.pop()?.url;
        if (artistId && name) results.push({ artistId, name, thumbnail });
      }
    }
  }
  return results;
}

// 🏠 Combine all sections for homepage
export async function getHomeData() {
  try {
    const [trending, playlists, featured, artists] = await Promise.all([
      getTrendingSongs(),
      getSuggestedPlaylists(),
      getFeaturedContent(),
      getPopularArtists()
    ]);

    return {
      trending,
      playlists,
      featured,
      artists
    };
  } catch (err) {
    console.error('Error loading home data:', err.message);
    return { trending: [], playlists: [], featured: [], artists: [] };
  }
}