import { useEffect, useState, useRef } from "react";
import api from "@/lib/axios"; // your configured axios instance

export function usePlaylistData(browseId, params) {
  const [data, setData] = useState(null); // playlist page data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!browseId || fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchPlaylistData() {
      try {
        const url = `/browse?browseId=${browseId}${
          params ? `&params=${encodeURIComponent(params)}` : ""
        }`;
        const res = await api.get(url);
        // backend endpoint like /api/playlist/:browseId
        setData(res.data);
      } catch (err) {
        console.error("Failed to load playlist:", err);
        setError(err.message || "Failed to load playlist data");
      } finally {
        setLoading(false);
      }
    }

    fetchPlaylistData();
  }, [browseId, params]);

  return { data, loading, error };
}
