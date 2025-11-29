import React, { useEffect } from "react";
import { useLikedSongData } from "../../hooks/useLikedSongsData";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Loader2 } from "lucide-react";

const LikedSongs = () => {
  const { data, isLoading, isError, error } = useLikedSongData();

  // Correct shape: data is an ARRAY
  const songs = data || [];

  // ✅ Get both playTrack AND setQueue from store
  const { playTrack, setQueue, currentTrack, isPlaying } = usePlayerStore();

  // ✅ AUTOMATICALLY SET QUEUE WHEN LIKED SONGS LOAD
  useEffect(() => {
    if (songs.length > 0) {
      setQueue(songs, 0); // Set the entire liked songs as queue and start from first song
    }
  }, [songs, setQueue]); // Run when songs data changes

  const handleSongClick = (song, index) => {
    // Now this will play from the already-set queue
    playTrack(song);
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs, 0);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    );

  if (isError)
    return (
      <div className="text-center text-red-500 mt-10">
        Failed to load: {error}
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-black text-white pb-15">
      {/* ✅ Header (fixed height, no scroll) */}
      <div className="flex-shrink-0 p-8 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <img
            src={
              "https://www.gstatic.com/youtube/media/ytm/images/pbg/liked-songs-delhi-1200.png" ||
              ""
            }
            alt={"Liked Song" || ""}
            className="rounded-2xl w-48 h-48 object-cover shadow-md"
          />
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="text-3xl font-bold">Liked Songs</h1>
            <p className="text-gray-400 mt-2">{songs.length} liked songs</p>
            
            {/* Play Button - Manual control */}
            <button
              onClick={handlePlayAll}
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

      {/* ✅ Scrollable Songs Section */}
      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-2">
        {songs.map((song, index) => (
          <div
            onClick={() => handleSongClick(song, index)}
            key={index}
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
              src={song.thumbnail || null}
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

export default LikedSongs;