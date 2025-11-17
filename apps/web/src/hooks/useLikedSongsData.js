import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";

export function useLikedSongData() {
  const { user, isLoaded } = useUser();

  return useQuery({
    queryKey: ["likedSongs", user?.id],
    enabled: isLoaded && !!user?.id,
    queryFn: async () => {
      try {
        const res = await api.get(`/liked/${user.id}`);
        console.log("🔥 API RESPONSE DATA:", res.data);

        // Backend returns: { likedSongs: [...] }
        const likedSongs = res.data?.likedSongs;

        if (!Array.isArray(likedSongs)) {
          toast.error("Invalid liked songs response.");
          return [];
        }

        return likedSongs;

      } catch (err) {
        console.log("🔥 ERROR FROM API:", err?.response?.data);
        toast.error("Unable to fetch liked songs.");
        return [];
      }
    },

    staleTime: 1000 * 60 * 5,
  });
}
