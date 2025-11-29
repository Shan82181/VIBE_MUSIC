// src/components/QueueDrawer.jsx
import React from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const QueueDrawer = ({ open, onClose }) => {
  const { 
    queue, 
    queueIndex, 
    currentTrack,
    playTrackAtIndex,
    removeFromQueue,
    clearQueue
  } = usePlayerStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end">
      <div className="bg-[#181818] w-96 h-full border-l border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-white text-xl font-bold">Queue</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Queue Info */}
        <div className="p-4 border-b border-gray-700">
          <p className="text-white">
            <span className="text-gray-400">Now Playing:</span> {currentTrack?.title}
          </p>
          <p className="text-sm text-gray-400">
            {queue.length} tracks in queue
          </p>
          {queue.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearQueue}
              className="mt-2 text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
            >
              Clear Queue
            </Button>
          )}
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto">
          {queue.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p>Your queue is empty</p>
              <p className="text-sm mt-2">Add songs from playlists or albums to see them here</p>
            </div>
          ) : (
            <div className="p-2">
              {queue.map((track, index) => (
                <div
                  key={`${track.videoId}-${index}`}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    index === queueIndex
                      ? "bg-[#1DB954] bg-opacity-20 border border-[#1DB954]"
                      : "hover:bg-gray-800"
                  }`}
                  onClick={() => playTrackAtIndex(index)}
                >
                  {/* Track Number/Playing Indicator */}
                  <div className="w-6 text-center">
                    {index === queueIndex ? (
                      <div className="w-4 h-4 bg-[#1DB954] rounded-full"></div>
                    ) : (
                      <span className="text-gray-400 text-sm">{index + 1}</span>
                    )}
                  </div>

                  {/* Track Image */}
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-12 h-12 rounded-md object-cover"
                  />

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      index === queueIndex ? "text-[#1DB954]" : "text-white"
                    }`}>
                      {track.title}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {track.artist}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(index);
                    }}
                    className="text-gray-400 hover:text-white hover:bg-red-500 hover:bg-opacity-20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueDrawer;