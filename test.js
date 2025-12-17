// src/components/GlobalPlayerBar.jsx
import React, { useState } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useUser } from "@clerk/clerk-react";
import { useUserPlaylistMutations } from "../hooks/useUserPlaylistMutations.js";
import { useUserPlaylists } from "../hooks/useUserPlaylist.js";
import { toast } from "react-toastify";

import LikeButton from "./LikedButton";
import AddToPlaylistModal from "./userPlaylist/AddToPlaylistModal";

import { Ellipsis } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import LikeButtonErrorBoundary from "./ErrorBoundary/LikeButtonErrorBoundary.jsx";
import { useLikedSongData } from "@/hooks/useLikedSongsData.js";
import { Slider } from "@/components/ui/slider";
import QueueDrawer from "./QueueDrawer";

export default function GlobalPlayerBar() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);

  // Hooks MUST always stay top
  const { user, isLoaded } = useUser();
  const userId = isLoaded && user ? user.id : null;

  // ✅ Get ALL player state and actions at once
  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    shuffle,
    loop,
    queue,
    queueIndex,
    togglePlay,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleLoop,
    seekTo,
    setVolume,
    getQueueInfo,
  } = usePlayerStore();

  useLikedSongData(); // Required for smooth updates

  const { addSongToPlaylist } = useUserPlaylistMutations(
    isLoaded ? user.id : null
  );
  const { data: playlists = [], refetch } = useUserPlaylists(userId);

  // Toggle queue drawer
  const toggleQueueDrawer = () => {
    setShowQueueDrawer(!showQueueDrawer);
  };

  // Format time for display
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get current time and duration from store
  const { currentTime, duration } = usePlayerStore();

  // Debug queue state
  // console.log("Queue State:", {
  //   queueLength: queue.length,
  //   queueIndex,
  //   currentTrack: currentTrack?.title,
  //   hasQueue: queue.length > 0
  // });

  if (!user) return null;
  if (!currentTrack) return null;

  const queueInfo = getQueueInfo();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-gray-700 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        {/* LEFT SIDE - Current Track Info */}
        <div className="flex items-center gap-3 w-1/3 min-w-0">
          <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center">
            {currentTrack.thumbnail ? (
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-lg">🎵</span>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-white font-medium truncate">
              {currentTrack.title}
            </p>
            <p className="text-sm text-gray-400 truncate">
              {currentTrack.artist || "Unknown Artist"}
            </p>

            {/* Queue Position Info - Only show if we have a queue */}
            {queue.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {queueInfo.positionInQueue} of {queueInfo.queueLength} in queue
              </div>
            )}
          </div>
        </div>

        {/* CENTER - Playback Controls */}
        <div className="flex flex-col items-center w-1/3">
          <div className="flex items-center gap-4 mb-2">
            {/* Shuffle Button */}
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-colors ${
                shuffle
                  ? "text-[#1DB954] hover:text-[#1ed760]"
                  : "text-gray-400 hover:text-white"
              }`}
              title={shuffle ? "Disable shuffle" : "Enable shuffle"}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
              </svg>
            </button>

            {/* Previous Track */}
            <button
              onClick={playPrevious}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
              title="Previous track"
              disabled={queue.length === 0 || queueIndex <= 0}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-105 transition-transform hover:bg-[#1ed760]"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={playNext}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
              title="Next track"
              disabled={queue.length === 0 || queueIndex >= queue.length - 1}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            {/* Loop Button */}
            <button
              onClick={toggleLoop}
              className={`p-2 rounded-full transition-colors ${
                loop !== "none"
                  ? "text-[#1DB954] hover:text-[#1ed760]"
                  : "text-gray-400 hover:text-white"
              }`}
              title={
                loop === "none"
                  ? "Enable loop"
                  : loop === "one"
                  ? "Loop one track"
                  : "Loop all tracks"
              }
            >
              {loop === "one" ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                  <text x="8" y="19" fontSize="8" fill="currentColor">
                    1
                  </text>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                </svg>
              )}
            </button>
          </div>

          {/* Progress Bar with Time */}
          <div className="flex items-center gap-3 w-full max-w-2xl">
            <span className="text-xs text-gray-400 min-w-[40px] text-right">
              {formatTime(currentTime)}
            </span>

            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              onValueChange={(val) => {
                seekTo(val[0]);
              }}
              className="w-full cursor-pointer"
              trackClassName="bg-gray-700"
              rangeClassName="bg-[#1DB954]"
            />

            <span className="text-xs text-gray-400 min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* RIGHT SIDE - Additional Controls */}
        <div className="w-1/3 flex justify-end gap-3 text-gray-400">
          {/* Volume Control */}
          <div className="relative group flex items-center">
            {/* Volume Icon */}
            <button
              className="hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              title={`Volume: ${Math.round(volume)}%`} // Removed *100; now shows 0-100%
            >
              {volume === 0 ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 9H6c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1.29l3.66 3.66c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.05 5.05a.996.996 0 00-1.41 0l-3.66 3.66c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L3.63 3.63zm12.5 12.5l-1.41-1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                </svg>
              ) : volume < 50 ? ( // Changed from 0.5 to 50 (mid-volume threshold)
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>

            {/* Volume Slider */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 bg-neutral-900 p-3 rounded-lg shadow-xl border border-neutral-700">
              <Slider
                orientation="vertical"
                value={[volume]} // Removed *100; now directly uses 0-100
                onValueChange={(v) => setVolume(v[0])} // Passes 0-100 to store
                max={100}
                step={1}
                className="h-28"
                trackClassName="bg-gray-700"
                rangeClassName="bg-[#1DB954]"
              />
            </div>
          </div>
          {/* Queue Button */}
          <button
            onClick={toggleQueueDrawer}
            className={`p-2 transition-colors rounded-full hover:bg-white/10 ${
              queue.length > 0
                ? "text-gray-400 hover:text-white"
                : "text-gray-600 cursor-not-allowed"
            }`}
            title={queue.length > 0 ? "Show queue" : "Queue is empty"}
            disabled={queue.length === 0}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
            </svg>
            {queue.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#1DB954] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {queue.length}
              </span>
            )}
          </button>
          {/* More Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                <Ellipsis className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-neutral-800 text-white border-neutral-700 w-48">
              <DropdownMenuItem
                onClick={() => setShowAddDialog(true)}
                className="cursor-pointer focus:bg-neutral-700"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Add to playlist
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  toast.info(
                    `Queue: ${queueInfo.positionInQueue} of ${queueInfo.queueLength} tracks`
                  );
                }}
                className="cursor-pointer focus:bg-neutral-700"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2z" />
                </svg>
                Queue info
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Like Button */}
          <LikeButtonErrorBoundary>
            <LikeButton song={currentTrack} />
          </LikeButtonErrorBoundary>
        </div>
      </div>

      {/* ADD TO PLAYLIST MODAL */}
      <AddToPlaylistModal
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        playlists={Array.isArray(playlists) ? playlists : []}
        refetchPlaylists={refetch}
        song={currentTrack}
        userId={user.id}
        onAddSong={async (playlistId, song) => {
          try {
            await addSongToPlaylist({ playlistId, song });
            toast.success("Song added to playlist!");
            setShowAddDialog(false);
            refetch();
          } catch (err) {
            if (
              err?.response?.status === 400 ||
              err?.response?.status === 409
            ) {
              toast.warn("Song already exists in playlist");
            } else {
              toast.error("Failed to add song");
            }
          }
        }}
      />

      {/* QUEUE DRAWER - Fixed prop passing */}
      {showQueueDrawer && (
        <QueueDrawer open={showQueueDrawer} onClose={toggleQueueDrawer} />
      )}
    </div>
  );
}
