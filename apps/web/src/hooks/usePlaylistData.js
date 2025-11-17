import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export function usePlaylistData(browseId, params) {
  return useQuery({
    queryKey: ["playlist", browseId, params], // 🔥 unique cache per playlist
    queryFn: async () => {
      const url = `/browse?browseId=${browseId}${
        params ? `&params=${encodeURIComponent(params)}` : ""
      }`;

      const res = await api.get(url);
      return res.data; // ✔️ correct
    },

    enabled: Boolean(browseId), // prevents empty calls
    staleTime: 1000 * 60 * 5,   // optional: 5 min cache
  });
}
