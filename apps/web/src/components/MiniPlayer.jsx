import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { usePlayerStore } from "@/store/usePlayerStore";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function MiniPlayer() {
  const { getToken } = useAuth();
  const query = useQuery().get("q");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🎵 global player state (Zustand)
  const { currentTrack, isPlaying, playTrack } = usePlayerStore();

  // 🔍 fetch search results
  useEffect(() => {
    async function fetchSongs() {
      if (!query) return;
      setLoading(true);
      try {
        const token = await getToken();
        const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(
          `${ VITE_BACKEND_URL}/api/search?q=${encodeURIComponent(query)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setResults(res.data || []);
      } catch (err) {
        console.error("❌ Error fetching search results:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, [query, getToken]);

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 🖱️ play selected track using global player
  const handlePlayClick = (track) => {
    playTrack(track); // handled globally
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#181818] rounded-lg shadow-2xl overflow-hidden">
      {/* ===== Header ===== */}
      <div className="bg-gradient-to-r from-[#1DB954] to-[#1ed760] p-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="bg-white text-[#1DB954] p-2 rounded-lg">🎵</span>
          Search Results
          {query && (
            <span className="text-lg font-normal opacity-90"> for "{query}"</span>
          )}
        </h1>
        <p className="text-white opacity-90 mt-1">
          {results.length} {results.length === 1 ? "song" : "songs"} found
        </p>
      </div>

      {/* ===== Results ===== */}
      <div className="p-6 max-h-[480px] overflow-y-auto">
        {loading ? (
          // shimmer placeholders
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg bg-[#282828] animate-pulse"
              >
                <div className="w-10 h-10 bg-[#333] rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#333] rounded w-3/4"></div>
                  <div className="h-3 bg-[#333] rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          // no results found
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">🎵</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No results found
            </h3>
            <p className="text-gray-400">
              {query
                ? `No songs found for "${query}"`
                : "Search for songs to get started"}
            </p>
          </div>
        ) : (
          // results list
          <div className="space-y-2">
            {results.map((track, index) => (
              <div
                key={track.videoId || index}
                onClick={() => handlePlayClick(track)}
                className={`group flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentTrack?.videoId === track.videoId
                    ? "bg-[#1DB954] bg-opacity-20 border-l-4 border-[#1DB954]"
                    : "hover:bg-[#282828]"
                }`}
              >
                {/* number or play icon */}
                <div className="w-8 flex items-center justify-center">
                  {currentTrack?.videoId === track.videoId && isPlaying ? (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-1 h-3 bg-[#1DB954] mr-1 animate-pulse"></div>
                      <div className="w-1 h-3 bg-[#1DB954] animate-pulse"></div>
                    </div>
                  ) : (
                    <>
                      <span className="group-hover:hidden text-gray-400 text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="hidden group-hover:block">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </>
                  )}
                </div>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium truncate ${
                      currentTrack?.videoId === track.videoId
                        ? "text-[#1DB954]"
                        : "text-white"
                    }`}
                  >
                    {track.title}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {track.artist || "Unknown Artist"}
                  </div>
                </div>

                {/* Album name */}
                <div className="hidden md:block flex-1 min-w-0">
                  <div className="text-sm text-gray-400 truncate">
                    {track.album || "Single"}
                  </div>
                </div>

                {/* Duration */}
                <div className="w-16 text-right">
                  <div
                    className={`text-sm ${
                      currentTrack?.videoId === track.videoId
                        ? "text-[#1DB954]"
                        : "text-gray-400"
                    } group-hover:text-white`}
                  >
                    {track.duration ? formatDuration(track.duration) : "3:30"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
