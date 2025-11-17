// src/components/CreatePlaylistModal.jsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CreatePlaylistModal({ open, onClose, onCreate,userId }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setLoading(true);

    await onCreate({
      userId,
      name,
      description: "",
      isPublic: false,
    });

    setLoading(false);
    setName("");     // RESET
    onClose();       // CLOSE SAFELY
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-neutral-900 text-white">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
          <DialogDescription className="text-gray-400">
            Make a new playlist where you can save your songs.
          </DialogDescription>
        </DialogHeader>

        {/* Playlist Name Input */}
        <Input
          placeholder="Enter playlist name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-neutral-800 border-neutral-700 text-white"
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
