import { useEffect, useState } from "react";
import api from "@/lib/axios";

export function useHomeData() {
  const [data, setData] = useState({ trending: [], playlists: [], featured: [], artists: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get("/home");
        setData(res.data);
      } catch (err) {
        setError(err.message || "Failed to load home data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
}
