import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useEffect } from "react";

export function useExploreData() {
  const query = useQuery({
    queryKey: ["explore"],
    queryFn: async () => {
      const res = await api.get("/explore");
      return res.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2, // retry twice on network failure
  });
   useEffect(() => {
  const d = query.data;

  // Valid explore response is an object with sections[]
  const isValid =
    d &&
    typeof d === "object" &&
    Array.isArray(d.sections);

  if (!isValid) {
    console.warn("⚠️ Explore page cache corrupted — repairing...");
    query.refetch();
  }
}, [query.data]);

  return query;
}
