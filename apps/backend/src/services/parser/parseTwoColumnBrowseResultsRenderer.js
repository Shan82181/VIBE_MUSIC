export function parseTwoColumnBrowseResultsRenderer(data) {
const result = {
    playlist: {
      title: null,
      thumbnail: null,
      subtitle: [],
      secondSubtitle: [],
    },
    songs: [],
  };

  try {
    // === Playlist Header ===
    const header =
      data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer
        ?.content?.sectionListRenderer?.contents?.[0]
        ?.musicResponsiveHeaderRenderer;

    if (header) {
      result.playlist.title =
        header?.title?.runs?.[0]?.text || "Unknown Playlist";

      const thumbs =
        header?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
      result.playlist.thumbnail = thumbs[thumbs.length - 1]?.url || "";

      result.playlist.subtitle = header?.subtitle?.runs?.map((r) => r.text) || [];
      result.playlist.secondSubtitle =
        header?.secondSubtitle?.runs?.map((r) => r.text) || [];
    }

    // === Playlist Songs Section ===
    const secondary =
      data?.contents?.twoColumnBrowseResultsRenderer?.secondaryContents
        ?.sectionListRenderer?.contents?.[0];

    const section =
      secondary?.musicShelfRenderer || secondary?.musicPlaylistShelfRenderer;

    const items = section?.contents || [];

    result.songs = items
      .map((item) => {
        const renderer = item?.musicResponsiveListItemRenderer;
        if (!renderer) return null;

        // Extract thumbnail
        const thumbList =
          renderer?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
        const thumbnail = thumbList[0]?.url || "";

        // Extract columns
        const flexCols = renderer?.flexColumns || [];
        const fixedCols = renderer?.fixedColumns || [];

        const title =
          flexCols?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]
            ?.text || "Unknown Title";

        const artist =
          flexCols?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs
            ?.map((r) => r.text)
            ?.join("") || "Unknown Artist";

        const album =
          flexCols?.[2]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]
            ?.text || null;

        const duration =
          fixedCols?.[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs?.[0]
            ?.text || null;

        // IDs
        const overlay =
          renderer?.overlay?.musicItemThumbnailOverlayRenderer?.content;
        const watchEndpoint =
          overlay?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint;

        const videoId = watchEndpoint?.videoId || null;
        const playlistId = watchEndpoint?.playlistId || null;

        return {
          videoId,
          playlistId,
          title,
          artist,
          album,
          duration,
          thumbnail,
        };
    }).filter(Boolean);
  } catch (err) {
    console.error("Error parsing playlist page:", err);
  }

  return result;
}