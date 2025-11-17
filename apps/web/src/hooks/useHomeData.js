import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export function useHomeData() {
  return useQuery({
    queryKey: ["home"], // unique cache key
    queryFn: async () => {
      const res = await api.get("/home");
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 min cache (recommended)
  });
}
