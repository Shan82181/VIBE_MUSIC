import React, { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { usePlaylistData } from "@/hooks/usePlaylistData";
import { usePlayerStore } from "@/store/usePlayerStore";

const PlaylistPage = () => {
  const { browseId } = useParams();
  const [searchParams] = useSearchParams();
  const params = searchParams.get("params");

  const { data, isLoading, isError, error, refetch } =
    usePlaylistData(browseId, params);

  // ✅ Get both playTrack AND setQueue from store
  const { playTrack, setQueue, currentTrack, isPlaying } = usePlayerStore();

  // 🔒 Protect against corrupted or incomplete cache
  const repairingCache =
    !data ||
    typeof data !== "object" ||
    !Array.isArray(data.songs) ||
    !data.playlist;

  // ✅ AUTOMATICALLY SET QUEUE WHEN PLAYLIST DATA LOADS
  useEffect(() => {
    if (data?.songs && data.songs.length > 0) {
      console.log(`Setting playlist "${data.playlist.title}" to queue with ${data.songs.length} songs`);
      setQueue(data.songs, 0); // Set entire playlist as queue, start from first song
    }
  }, [data, setQueue]); // Run when data changes

  if (isLoading || repairingCache) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <Loader2 className="animate-spin mr-2" /> Loading playlist…
      </div>
    );
  }

  // ❌ API Failure UI (but no crash)
  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-400">
        <p className="mb-3">Failed to load playlist 😔</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  // 🟢 SAFE access
  const playlist = data.playlist;
  const songs = data.songs;

  return (
    <div className="flex flex-col h-screen bg-black text-white pb-15">
      {/* Header */}
      <div className="flex-shrink-0 p-8 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <img
            src={playlist.thumbnail || ""}
            alt={playlist.title}
            className="rounded-2xl w-48 h-48 object-cover shadow-md"
          />
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="text-3xl font-bold">{playlist.title}</h1>
            <p className="text-gray-400 mt-2">
              {playlist.subtitle?.join(" • ")}
            </p>
            <p className="text-gray-500 mt-1">
              {playlist.secondSubtitle?.join(" • ")}
            </p>
            
            {/* Play Button - Manual control */}
            <button
              onClick={() => songs.length > 0 && setQueue(songs, 0)}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              {currentTrack ? "Restart Playlist" : "Play All"}
            </button>
            
            {/* Current Playing Status */}
            {currentTrack && (
              <div className="mt-2 text-sm text-green-400">
                Now Playing: {currentTrack.title}
                {isPlaying ? ' ▶' : ' ⏸'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-2">
        {songs.map((song, index) => (
          <div
            onClick={() => playTrack(song)}
            key={song.videoId || index}
            className={`flex items-center gap-4 py-3 px-2 hover:bg-gray-900 rounded-lg cursor-pointer transition-colors ${
              currentTrack?.videoId === song.videoId ? 'bg-gray-800 border-l-4 border-green-500' : ''
            }`}
          >
            {/* Track Number / Playing Indicator */}
            <div className="text-gray-400 w-6 text-right">
              {currentTrack?.videoId === song.videoId ? (
                isPlaying ? (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-4 h-4 border-2 border-green-500 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  </div>
                )
              ) : (
                index + 1
              )}
            </div>

            <img
              src={song.thumbnail || ""}
              alt={song.title}
              className="w-12 h-12 rounded-md object-cover"
            />

            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${
                currentTrack?.videoId === song.videoId ? 'text-green-400' : 'text-white'
              }`}>
                {song.title}
              </p>
              <p className="text-sm text-gray-400 truncate">{song.artist}</p>
            </div>

            <p className="text-sm text-gray-500">{song.duration}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistPage;