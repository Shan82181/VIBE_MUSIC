import { useEffect, useState , useRef} from "react";
import api from "@/lib/axios";
import { useUser} from "@clerk/clerk-react";
export function useLikedSongData() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false); 
  const { user } = useUser();
  useEffect(() => {
  if (!user) return; // wait for user to be available
  if (fetchedRef.current) return; // already fetched
  
  fetchedRef.current = true;
  
  async function fetchData() {
    try {
      const res = await api.get(`/${user.id}`);
      setData(res.data);
    } catch (err) {
      setError(err.message || "Failed to load liked songs");
    } finally {
      setLoading(false);
    }
  }

  fetchData();
}, [user]);


  return { data, loading, error };
}
