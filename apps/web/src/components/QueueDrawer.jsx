import React, { useEffect } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const BOTTOM_NAV_HEIGHT = 64;

const QueueDrawer = ({ open, onClose }) => {
  const {
    queue,
    queueIndex,
    currentTrack,
    playTrackAtIndex,
    removeFromQueue,
    clearQueue,
  } = usePlayerStore();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50"
      onClick={onClose}
    >
      {/* ================= MOBILE: BOTTOM SHEET ================= */}
      <div
        className="
          fixed left-0 right-0
          bottom-[64px]
          h-[70vh]
          bg-[#181818]
          rounded-t-2xl
          md:hidden
          flex flex-col
        "
        onClick={(e) => e.stopPropagation()}
      >
        <QueueContent
          queue={queue}
          queueIndex={queueIndex}
          currentTrack={currentTrack}
          playTrackAtIndex={playTrackAtIndex}
          removeFromQueue={removeFromQueue}
          clearQueue={clearQueue}
          onClose={onClose}
        />
      </div>

      {/* ================= DESKTOP: RIGHT DRAWER ================= */}
      <div
        className="
          hidden md:flex
          fixed right-0 top-0
          h-full w-96
          bg-[#181818]
          border-l border-gray-700
          flex-col
        "
        onClick={(e) => e.stopPropagation()}
      >
        <QueueContent
          queue={queue}
          queueIndex={queueIndex}
          currentTrack={currentTrack}
          playTrackAtIndex={playTrackAtIndex}
          removeFromQueue={removeFromQueue}
          clearQueue={clearQueue}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default QueueDrawer;

/* ================= SHARED CONTENT ================= */

const QueueContent = ({
  queue,
  queueIndex,
  currentTrack,
  playTrackAtIndex,
  removeFromQueue,
  clearQueue,
  onClose,
}) => (
  <>
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

    {/* Info */}
    <div className="p-4 border-b border-gray-700">
      <p className="text-white truncate">
        <span className="text-gray-400">Now Playing:</span>{" "}
        {currentTrack?.title || "—"}
      </p>
      <p className="text-sm text-gray-400">
        {queue.length} tracks in queue
      </p>

      {queue.length > 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={clearQueue}
          className="mt-2 text-red-400 border-red-400"
        >
          Clear Queue
        </Button>
      )}
    </div>

    {/* List */}
    <div className="flex-1 overflow-y-auto p-2">
      {queue.length === 0 ? (
        <p className="text-center text-gray-400 mt-8">
          Your queue is empty
        </p>
      ) : (
        queue.map((track, index) => {
          const active = index === queueIndex;

          return (
            <div
              key={`${track.videoId}-${index}`}
              onClick={() => playTrackAtIndex(index)}
              className={`
                flex items-center gap-3 p-3 rounded-lg cursor-pointer
                ${active ? "bg-[#1DB954]/20" : "hover:bg-gray-800"}
              `}
            >
              <span className="w-5 text-gray-400 text-sm">
                {active ? "▶" : index + 1}
              </span>

              <img
                src={track.thumbnail}
                className="w-12 h-12 rounded-md"
                alt=""
              />

              <div className="flex-1 min-w-0">
                <p className={`truncate ${active ? "text-[#1DB954]" : "text-white"}`}>
                  {track.title}
                </p>
                <p className="text-sm text-gray-400 truncate">
                  {track.artist}
                </p>
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromQueue(index);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          );
        })
      )}
    </div>
  </>
);
