import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export function usePlaylistData(browseId, params) {
  return useQuery({
    queryKey: ["playlist", browseId, params],
    queryFn: async () => {
      const url = `/browse?browseId=${browseId}${
        params ? `&params=${encodeURIComponent(params)}` : ""
      }`;

      const res = await api.get(url);
      return res.data;
    },

    enabled: Boolean(browseId),
    staleTime: 1000 * 60 * 5,
  });
}
