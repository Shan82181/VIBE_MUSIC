// src/components/userPlaylist/AddToPlaylistModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreatePlaylistModal } from "./CreatePlaylistModal";
import { useUserPlaylistMutations } from "../../hooks/useUserPlaylistMutations";


const AddToPlaylistModal = ({ open, onClose, playlists, song, onAddSong ,userId }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { createPlaylist } = useUserPlaylistMutations(userId);
  const handleCreatePlaylist = async (data) => {
    const newPlaylist = await createPlaylist(data);
    // After creating → auto add the song
    await onAddSong(newPlaylist._id, song);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm bg-neutral-900 text-white">
          <DialogHeader>
            <DialogTitle>Select Playlist</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose a playlist to add this song to, or create a new one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            {playlists?.map((p) => (
              <Button
                key={p._id}
                variant="ghost"
                className="w-full justify-start hover:bg-neutral-800"
                onClick={() => onAddSong(p._id, song)}
              >
                {p.name}
              </Button>
            ))}
          </div>

          <div className="border-t border-neutral-700 mt-3 pt-3">
            <Button
              className="w-full bg-neutral-800 hover:bg-neutral-700"
              onClick={() => setShowCreateDialog(true)}
            >
              ➕ New Playlist
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showCreateDialog && (
        <CreatePlaylistModal
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onCreate={handleCreatePlaylist}
          userId={userId}
        />
      )}
    </>
  );
};

export default AddToPlaylistModal;
