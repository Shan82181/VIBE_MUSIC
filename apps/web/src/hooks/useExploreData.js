import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export function useExploreData() {
  return useQuery({
    queryKey: ["explore"],
    queryFn: async () => {
      const res = await api.get("/explore");
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
