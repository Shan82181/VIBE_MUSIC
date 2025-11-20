import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import { useEffect } from "react";

export function useUserPlaylists(userId) {
  const query = useQuery({
    queryKey: ["userPlaylists", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await api.get(`/playlists/user/${userId}`);
      // console.log("🔥 User Playlists API Response:", res.data);
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // ⭐ Auto-Repair System
  useEffect(() => {
    if (
      query.data === undefined ||
      query.data === null ||
      !Array.isArray(query.data)
    ) {
      console.warn("⚠️ User Playlist cache corrupted, repairing...");
      query.refetch();
    }
  }, [query.data]);

  return {
    data: Array.isArray(query.data) ? query.data : [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,   // ⭐ important
  };
}
