// src/hooks/useHomeData.js
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useEffect } from "react";

export function useHomeData() {
  const query = useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const res = await api.get("/home");

      // Validate response shape
      if (!res.data || typeof res.data !== "object") {
        console.warn("⚠️ Invalid home API response:", res.data);
        return { sections: [] };
      }

      // sections must be an array
      if (!Array.isArray(res.data.sections)) {
        console.warn("⚠️ Invalid sections format:", res.data.sections);
        return { sections: [] };
      }

      return res.data;
    },

    staleTime: 1000 * 60 * 5,
    retry: 2,          // retry on failure
    refetchOnWindowFocus: false,
  });

  // ⭐ Auto-repair corrupted cache
  useEffect(() => {
    if (
      query.data === undefined ||
      query.data === null ||
      typeof query.data !== "object" ||
      !Array.isArray(query.data.sections)
    ) {
      console.warn("⚠️ Home page cache corrupted — repairing...");
      query.refetch();
    }
  }, [query.data]);

  return query;
}
