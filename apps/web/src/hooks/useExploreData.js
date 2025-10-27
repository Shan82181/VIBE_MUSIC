import { useEffect, useState , useRef} from "react";
import api from "@/lib/axios";

export function useExploreData() {
  const [data, setData] = useState({ trending: [], playlists: [], featured: [], artists: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false); 

  useEffect(() => {
    if (fetchedRef.current) return; // already fetched
    fetchedRef.current = true;
    async function fetchData() {
      try {
        const res = await api.get("/explore");
        setData(res.data);
        //console.log("Home data fetched:", res.data);
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
