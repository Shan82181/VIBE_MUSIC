import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "react-toastify";

export function useUserPlaylists(userId) {
  const query = useQuery({
    queryKey: ["userPlaylists", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await api.get(`/playlists/user/${userId}`);
      console.log("🔥 User Playlists API Response:", res.data);
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,   // ⭐ important
  };
}
