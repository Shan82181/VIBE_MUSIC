import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Plus, Music2 } from "lucide-react";
import { CreatePlaylistModal } from "../../components/userPlaylist/CreatePlaylistModal";
import { useUserPlaylists } from "../../hooks/useUserPlaylist";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreatePlaylist = () => {
  const { user, isLoaded } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navigate = useNavigate();

  // ⬇ React Query hook
  const {
    data: playlists = [],
    isLoading,
    isError,
    refetch,
  } = useUserPlaylists(isLoaded ? user.id : null);

  // 🟡 Loading State
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        Loading your playlists...
      </div>
    );

  // 🔴 Error State (won't break UI)
  if (isError)
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-400">
        <p className="mb-4">Failed to load playlists 😔</p>
        <Button
          onClick={() => refetch()}
          className="bg-white text-black hover:bg-gray-200 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Retrying...
            </>
          ) : (
            "Try Again"
          )}
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Playlists</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#1DB954] hover:bg-[#17a74a]"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Playlist
        </Button>
      </div>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
          <Music2 className="w-12 h-12 mb-2" />
          <p>No playlists yet.</p>
          <p className="text-sm">Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              onClick={() => navigate(`/userplaylist/${playlist._id}`)}
              className="bg-neutral-900 p-4 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {playlist.songs.slice(0, 4).map((song) => song.thumbnail) ? (
                <div className="grid grid-cols-2 grid-rows-2 w-40 h-40 overflow-hidden rounded-lg">
                  {playlist.songs.slice(0, 4).map((song) => song.thumbnail).map((t, i) => (
                    <img
                      key={i}
                      src={t}
                      className="w-full h-full object-cover"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-36 bg-neutral-700 rounded-md flex items-center justify-center mb-3">
                  <Music2 className="w-8 h-8 text-gray-300" />
                </div>
              )}
              <h2 className="font-semibold truncate">{playlist.name}</h2>
              <p className="text-sm text-gray-400 truncate">
                {playlist.songs.length} songs
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showCreateModal && (
        <CreatePlaylistModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={async (playlistData) => {
            await createPlaylist({
              userId: user.id,
              ...playlistData,
            });

            // await refetch(); // refresh after create
          }}
        />
      )}
    </div>
  );
};

export default CreatePlaylist;
