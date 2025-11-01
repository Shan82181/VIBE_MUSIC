import { useEffect, useState, useRef } from "react";
import api from "@/lib/axios"; // your configured axios instance

export function usePlaylistData(browseId) {
  const [data, setData] = useState(null); // playlist page data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!browseId || fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchPlaylistData() {
      try {
        const res = await api.get(`/browse/${browseId}`); 
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
  }, [browseId]);

  return { data, loading, error };
}
