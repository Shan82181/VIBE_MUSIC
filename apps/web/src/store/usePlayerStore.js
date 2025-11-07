import { create } from "zustand";

export const usePlayerStore = create((set, get) => ({
  audio: new Audio(),
  currentTrack: null,
  isPlaying: false,
  progress: 0,

  playTrack: async (track) => {
    const { audio, currentTrack, isPlaying } = get();

    try {
      // toggle play/pause for same track
      if (currentTrack?.videoId === track.videoId) {
        if (isPlaying) {
          audio.pause();
          set({ isPlaying: false });
        } else {
          await audio.play();
          set({ isPlaying: true });
        }
        return;
      }

      // new track
      audio.src = `http://localhost:3000/api/proxy/${track.videoId}`;
      await audio.play();
      set({
        currentTrack: track,
        isPlaying: true,
        progress: 0,
      });
    } catch (err) {
      console.error("Playback error:", err);
    }
  },

  togglePlay: () => {
    const { audio, isPlaying } = get();
    if (isPlaying) {
      audio.pause();
      set({ isPlaying: false });
    } else {
      audio.play();
      set({ isPlaying: true });
    }
  },

  updateProgress: () => {
    const { audio } = get();
    set({ progress: (audio.currentTime / audio.duration) * 100 || 0 });
  },
}));
