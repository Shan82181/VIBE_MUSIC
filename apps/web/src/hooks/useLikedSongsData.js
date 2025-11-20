import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import { useEffect } from "react";

export function useLikedSongData() {
  const { user, isLoaded } = useUser();

  // 1️⃣ Call the query FIRST
  const query = useQuery({
    queryKey: ["likedSongs", user?.id],
    enabled: isLoaded && !!user?.id,
    queryFn: async () => {
      try {
        const res = await api.get(`/liked/${user.id}`);

        const likedSongs = res.data?.likedSongs;

        if (!Array.isArray(likedSongs)) {
          console.warn("❗ Invalid liked songs response:", likedSongs);
          return [];
        }

        return likedSongs;

      } catch (err) {
        console.log("🔥 ERROR:", err?.response?.data);
        toast.error("Unable to fetch liked songs.");
        return [];
      }
    },

    staleTime: 1000 * 60 * 5,
  });

  // 2️⃣ Auto-Repair Cache System
  useEffect(() => {
    if (
      query.data === undefined ||
      query.data === null ||
      !Array.isArray(query.data)
    ) {
      console.warn("⚠️ LikedSongs cache corrupted — repairing...");
      query.refetch();
    }
  }, [query.data]);

  return query;
}
