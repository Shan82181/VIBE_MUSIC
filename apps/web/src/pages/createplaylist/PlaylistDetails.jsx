import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUserSinglePlaylist } from "../../hooks/useUserSinglePlaylist";
import { usePlayerStore } from "@/store/usePlayerStore";

const PlaylistDetails = () => {
  const { id } = useParams();
  const {
    data: playlist = [],
    isLoading,
    isError,
    refetch,
  } = useUserSinglePlaylist(id);
  const songs = playlist.songs || [];
  const thumbnails = songs.slice(0, 4).map((song) => song.thumbnail);
  const { playTrack, setQueue, currentTrack, isPlaying } = usePlayerStore();
  // ✅ AUTOMATICALLY SET QUEUE WHEN PLAYLIST DATA LOADS
  useEffect(() => {
    if (playlist?.songs && playlist.songs.length > 0) {
      console.log(
        `Setting playlist to queue with ${playlist.songs.length} songs`
      );
      setQueue(playlist.songs, 0); // Set entire playlist as queue, start from first song
    }
  }, [playlist, setQueue]); // Run when data changes

  if (isLoading)
    return <div className="text-gray-400 p-6">Loading playlist...</div>;

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

  return (
    <div className="flex flex-col h-screen bg-black text-white pb-15">
      {/* Header */}
      <div className="flex-shrink-0 p-8 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <div className="grid grid-cols-2 grid-rows-2 w-40 h-40 overflow-hidden rounded-lg">
            {thumbnails.map((t, i) => (
              <img key={i} src={t} className="w-full h-full object-cover" />
            ))}
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="text-3xl font-bold">{playlist.name}</h1>

            {/* Play Button - Manual control */}
            <button
              onClick={() => songs.length > 0 && setQueue(songs, 0)}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {currentTrack ? "Restart Playlist" : "Play All"}
            </button>

            {/* Current Playing Status */}
            {currentTrack && (
              <div className="mt-2 text-sm text-green-400">
                Now Playing: {currentTrack.title}
                {isPlaying ? " ▶" : " ⏸"}
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
              currentTrack?.videoId === song.videoId
                ? "bg-gray-800 border-l-4 border-green-500"
                : ""
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
              <p
                className={`font-medium truncate ${
                  currentTrack?.videoId === song.videoId
                    ? "text-green-400"
                    : "text-white"
                }`}
              >
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

export default PlaylistDetails;
