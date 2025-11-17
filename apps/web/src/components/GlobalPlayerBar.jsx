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

export default function GlobalPlayerBar() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Hooks MUST always stay top
  const { user , isLoaded} = useUser();
  const { currentTrack, isPlaying, progress, togglePlay } = usePlayerStore();
  const { addSongToPlaylist } = useUserPlaylistMutations(isLoaded ? user.id : null);
  const {
    data: playlists = [],
    refetch,
  } = useUserPlaylists(isLoaded ? user.id : null);

  if (!user) return null;
  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-gray-700 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">

        {/* LEFT SIDE */}
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
            <p className="text-white font-medium truncate">{currentTrack.title}</p>
            <p className="text-sm text-gray-400 truncate">
              {currentTrack.artist || "Unknown Artist"}
            </p>
          </div>
        </div>

        {/* CENTER */}
        <div className="flex flex-col items-center w-1/3">
          <div className="flex items-center gap-6 mb-2">
            {/* Previous */}
            <button className="text-gray-400 hover:text-white">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 20L9 12l10-8v16zM5 20V4h2v16H5z" />
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Next */}
            <button className="text-gray-400 hover:text-white">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 4l10 8-10 8V4zm12 0h2v16h-2V4z" />
              </svg>
            </button>
          </div>

          <div className="w-full bg-gray-600 rounded-full h-1">
            <div
              className="bg-[#1DB954] h-1 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-1/3 flex justify-end gap-4 text-gray-400">
          <button className="hover:text-white">🔊</button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Ellipsis className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-neutral-800 text-white border-neutral-700">
              <DropdownMenuItem onClick={() => setShowAddDialog(true)}>
                ➕ Add to playlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <LikeButton song={currentTrack} />
        </div>
      </div>

      {/* ADD TO PLAYLIST MODAL */}
      <AddToPlaylistModal
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        playlists={playlists}
        song={currentTrack}
        userId={user.id}
        onAddSong={async (playlistId, song) => {
          try {
            await addSongToPlaylist({ playlistId, song });
            toast.success("Song added to playlist!");
            setShowAddDialog(false);
            refetch();
          } catch (err) {
            if (err?.response?.status === 400 || err?.response?.status === 409) {
              toast.warn("Song already exists in playlist");
            } else {
              toast.error("Failed to add song");
            }
          }
        }}
      />
    </div>
  );
}
