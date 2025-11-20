import React from "react";
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

  const { playTrack } = usePlayerStore();

  // 🔒 Protect against corrupted or incomplete cache
  const repairingCache =
    !data ||
    typeof data !== "object" ||
    !Array.isArray(data.songs) ||
    !data.playlist;

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
          <div>
            <h1 className="text-3xl font-bold">{playlist.title}</h1>
            <p className="text-gray-400 mt-2">
              {playlist.subtitle?.join(" • ")}
            </p>
            <p className="text-gray-500 mt-1">
              {playlist.secondSubtitle?.join(" • ")}
            </p>
          </div>
        </div>
      </div>

      {/* Songs */}
      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-2">
        {songs.map((song, index) => (
          <div
            onClick={() => playTrack(song)}
            key={song.videoId || index}
            className="flex items-center gap-4 py-3 px-2 hover:bg-gray-900 rounded-lg cursor-pointer"
          >
            <p className="text-gray-400 w-6 text-right">{index + 1}</p>

            <img
              src={song.thumbnail || ""}
              alt={song.title}
              className="w-12 h-12 rounded-md object-cover"
            />

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{song.title}</p>
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
