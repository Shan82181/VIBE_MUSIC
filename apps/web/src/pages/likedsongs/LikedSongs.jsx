import React from "react";
import { useLikedSongData } from "../../hooks/useLikedSongsData";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Loader2 } from "lucide-react";

const LikedSongs = () => {
  const { data, isLoading, isError, error } = useLikedSongData();

  // Correct shape: data is an ARRAY
  const songs = data || [];

  const { playTrack } = usePlayerStore();
  const handleSongClick = (song) => {
    playTrack(song);
  };
  // console.log("Liked Songs Data:", songs);
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
          <div>
            <h1 className="text-3xl font-bold">Liked Songs</h1>
            <p className="text-gray-400 mt-2">Auto Playlist . 2025</p>
          </div>
        </div>
      </div>

      {/* ✅ Scrollable Songs Section */}
      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-2 ">
        {songs.map((song, index) => (
          <div
            onClick={() => handleSongClick(song)}
            key={song.videoId || index}
            className="flex items-center gap-4 py-3 px-2 hover:bg-gray-900 rounded-lg cursor-pointer transition-colors"
          >
            <p className="text-gray-400 w-6 text-right">{index + 1}</p>

            <img
              src={song.thumbnail || null}
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

export default LikedSongs;
