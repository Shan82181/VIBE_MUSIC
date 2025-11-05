export function parseSingleColumnBrowseResultsRenderer(data) {
  const root = data?.contents?.singleColumnBrowseResultsRenderer;
  if (!root) return { sections: [] };

  const tab = root?.tabs?.[0]?.tabRenderer;
  const sectionList = tab?.content?.sectionListRenderer?.contents || [];

  const sections = [];

  for (const section of sectionList) {
    // 1️⃣ Navigation Buttons Section (gridRenderer)
    // if (section.gridRenderer) {
    //   const buttons = [];
    //   for (const item of section.gridRenderer.items || []) {
    //     const btn = item.musicNavigationButtonRenderer;
    //     if (!btn) continue;

    //     const title = btn.buttontext?.runs?.[0]?.text || btn.buttonText?.runs?.[0]?.text || "";
    //     const browseId =
    //       btn.clickCommand?.browseEndpoint?.browseId ||
    //       btn.navigationEndpoint?.browseEndpoint?.browseId;

    //     buttons.push({ type: "button", title, browseId });
    //   }
    //   if (buttons.length)
    //     sections.push({ title: "Navigation", items: buttons });
    // }

    if (section.gridRenderer) {
      const items = [];

      for (const item of section.gridRenderer.items || []) {
        // 🎯 Case 1 — Navigation Buttons
        const btn = item?.musicNavigationButtonRenderer;
        if (btn) {
          const title =
            btn.buttonText?.runs?.[0]?.text ||
            btn.buttontext?.runs?.[0]?.text ||
            "";

          const browseId =
            btn.clickCommand?.browseEndpoint?.browseId ||
            btn.navigationEndpoint?.browseEndpoint?.browseId ||
            null;
          const params =
            btn.clickCommand?.browseEndpoint?.params ||
            btn.navigationEndpoint?.browseEndpoint?.params ||
            null;
          

          items.push({
            type: "button",
            title,
            browseId,
            params,
          });
          continue;
        }

        // 🎯 Case 2 — Playlists / Albums (Two Row Items)
        const twoRow = item?.musicTwoRowItemRenderer;
        if (twoRow) {
          const title = twoRow.title?.runs?.[0]?.text || "Unknown Title";
          const subtitle =
            twoRow.subtitle?.runs?.map((r) => r.text).join("") || "";
          const browseId =
            twoRow.navigationEndpoint?.browseEndpoint?.browseId || null;

          const thumbList =
            twoRow.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail
              ?.thumbnails || [];
          const thumbnail = thumbList[thumbList.length - 1]?.url || "";

          items.push({
            type: "playlist",
            title,
            subtitle,
            browseId,
            thumbnail,
          });
        }
      }

      if (items.length) {
        const title =
          section.gridRenderer.header?.gridHeaderRenderer?.title?.runs?.[0]
            ?.text || "Navigation";

        sections.push({ title, items });
      }
    }

    // 2️⃣ Carousel Shelves (albums, moods, trending, etc.)
    if (section.musicCarouselShelfRenderer) {
      const shelf = section.musicCarouselShelfRenderer;
      const shelfTitle =
        shelf.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]
          ?.text || "";
      const items = [];

      for (const content of shelf.contents || []) {
        // Album / Playlist
        if (content.musicTwoRowItemRenderer) {
          const r = content.musicTwoRowItemRenderer;
          const title = r.title?.runs?.[0]?.text || "";
          const browseId = r.navigationEndpoint?.browseEndpoint?.browseId || "";
          const subtitle = r.subtitle?.runs?.map((t) => t.text).join("") || "";
          const artist =
            r.subtitle?.runs
              ?.map((r) => r.text)
              .filter((t) => !t.includes("•") && t.trim() !== "")
              .pop() || "";
          const thumbnail =
            r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.at(
              -1
            )?.url;

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
            r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text
              ?.runs?.[0]?.text || "";
          const videoId = r.playlistItemData?.videoId;
          const thumbnail =
            r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.at(
              -1
            )?.url;
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
          const params =
            btn.clickCommand?.browseEndpoint?.params ||
            btn.navigationEndpoint?.browseEndpoint?.params ||
            null;
          items.push({
            type: "category",
            title,
            browseId,
            params,
          });
        }
      }

      if (items.length) sections.push({ title: shelfTitle, items });
    }
  }

  return { type: "explore", sections };
}
