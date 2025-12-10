// src/store/usePlayerStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usePlayerStore = create(
  persist(
    (set, get) => {
      // Create audio element once
      const audio = new Audio();

      // ================================
      // 🔊 AUDIO EVENT LISTENERS
      // ================================
      audio.addEventListener("loadedmetadata", () => {
        const { audio } = get();
        set({
          duration: audio.duration,
        });
      });

      audio.addEventListener("timeupdate", () => {
        const { audio } = get();
        set({
          currentTime: audio.currentTime,
          progress: audio.duration
            ? (audio.currentTime / audio.duration) * 100
            : 0,
        });
      });

      audio.addEventListener("ended", () => {
        console.log("Track ended, playing next...");
        get().playNext();
      });

      audio.addEventListener("loadstart", () => {
        set({ isBuffering: true });
      });

      audio.addEventListener("canplay", () => {
        set({ isBuffering: false });
      });

      audio.addEventListener("error", (e) => {
        console.error("Audio error:", e);
        set({ isPlaying: false, isBuffering: false });
      });

      return {
        // ================================
        // 🔥 PLAYER STATE
        // ================================
        audio,
        currentTrack: null,
        isPlaying: false,
        isBuffering: false,
        progress: 0,
        currentTime: 0,
        duration: 0,
        volume: 1,

        // QUEUE SYSTEM
        queue: [],
        queueIndex: -1, // -1 means no track is selected
        shuffle: false,
        loop: "none", // "none" | "one" | "all"

        // ================================
        // ➕ ADD TO QUEUE
        // ================================
        addToQueue: (tracks) => {
          const { queue, queueIndex, currentTrack } = get();

          // If tracks is a single object, convert to array
          const newTracks = Array.isArray(tracks) ? tracks : [tracks];

          if (newTracks.length === 0) {
            console.warn("addToQueue: No tracks to add");
            return;
          }

          const updatedQueue = [...queue, ...newTracks];
          let newQueueIndex = queueIndex;

          // If no track is currently playing and queue was empty, set to first track
          if (queueIndex === -1 && updatedQueue.length > 0) {
            newQueueIndex = 0;
          }

          set({
            queue: updatedQueue,
            queueIndex: newQueueIndex,
          });

          console.log(
            `Added ${newTracks.length} tracks to queue. Total: ${updatedQueue.length}`
          );

          // Auto-play if nothing is currently playing
          if (
            !currentTrack &&
            updatedQueue.length > 0 &&
            newQueueIndex !== -1
          ) {
            get().playTrack(updatedQueue[newQueueIndex]);
          }
        },

        // ================================
        // ▶ PLAY TRACK (GLOBAL)
        // ================================
        playTrack: async (track) => {
          const { audio, currentTrack, isPlaying, queue } = get();

          if (!track || !track.videoId) {
            console.error("playTrack: Invalid track provided", track);
            return;
          }

          try {
            // Toggle play/pause if same track
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

            // New track - update source and play
            const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
            const audioSrc = `${VITE_BACKEND_URL}/api/proxy/${track.videoId}`;
            //console.log("Playing track:", track.title, audioSrc);
            audio.src = audioSrc;
            audio.volume = get().volume;
            audio.currentTime = 0;

            await audio.play();

            // Find track index in queue if it exists
            const trackIndex = queue.findIndex(
              (t) => t.videoId === track.videoId
            );
            const newQueueIndex =
              trackIndex !== -1 ? trackIndex : get().queueIndex;

            set({
              currentTrack: track,
              isPlaying: true,
              progress: 0,
              currentTime: 0,
              queueIndex: newQueueIndex,
              isBuffering: false,
            });
          } catch (err) {
            console.error("Playback error:", err);
            set({ isPlaying: false, isBuffering: false });
          }
        },

        // ================================
        // ▶ SET QUEUE + START PLAY
        // ================================
        setQueue: (tracks, startIndex = 0) => {
          if (!tracks || tracks.length === 0) {
            console.warn("setQueue: No tracks provided");
            return;
          }

          const { currentTrack, audio } = get();
          const validStartIndex = Math.max(
            0,
            Math.min(startIndex, tracks.length - 1)
          );
          const startingTrack = tracks[validStartIndex];

          const isSameTrack = currentTrack?.videoId === startingTrack?.videoId;

          console.log(
            `Setting queue with ${tracks.length} tracks, starting at index ${validStartIndex}`
          );

          set({
            queue: tracks,
            queueIndex: validStartIndex,
          });

          // Only change audio if it's a different track
          if (!isSameTrack) {
            get().playTrack(startingTrack);
          } else {
            // Same track, just ensure it's playing and update queue context
            if (!get().isPlaying) {
              audio.play().catch(console.error);
            }
          }
        },

        // ================================
        // ▶ PLAY TRACK IN QUEUE BY INDEX
        // ================================
        playTrackAtIndex: (index) => {
          const { queue } = get();

          if (index < 0 || index >= queue.length) {
            console.warn(
              `playTrackAtIndex: Index ${index} out of bounds (queue length: ${queue.length})`
            );
            return;
          }

          console.log(`Playing track at queue index: ${index}`);
          set({ queueIndex: index });
          get().playTrack(queue[index]);
        },

        // ================================
        // ⏭️ PLAY NEXT TRACK (FIXED)
        // ================================
        playNext: () => {
          const { queue, queueIndex, shuffle, loop, audio, currentTrack } =
            get();

          console.log("playNext called:", {
            queueLength: queue.length,
            queueIndex,
            shuffle,
            loop,
            currentTrack: currentTrack?.title,
          });

          // No queue or invalid state
          if (!queue.length || queueIndex === -1) {
            console.log("No queue or invalid index - stopping playback");
            audio.pause();
            set({ isPlaying: false });
            return;
          }

          // LOOP ONE - restart current track
          if (loop === "one" && currentTrack) {
            console.log("Loop one - restarting current track");
            audio.currentTime = 0;
            audio.play().catch(console.error);
            return;
          }

          // SHUFFLE MODE
          if (shuffle) {
            let randomIndex;
            // Ensure we don't get the same track if queue has more than 1 track
            if (queue.length === 1) {
              randomIndex = 0;
            } else {
              do {
                randomIndex = Math.floor(Math.random() * queue.length);
              } while (randomIndex === queueIndex && queue.length > 1);
            }

            console.log("Shuffle - playing random index:", randomIndex);
            set({ queueIndex: randomIndex });
            get().playTrack(queue[randomIndex]);
            return;
          }

          const nextIndex = queueIndex + 1;

          // Regular next track in queue
          if (nextIndex < queue.length) {
            console.log("Playing next track at index:", nextIndex);
            set({ queueIndex: nextIndex });
            get().playTrack(queue[nextIndex]);
            return;
          }

          // END OF QUEUE - handle loop modes
          if (loop === "all") {
            // Loop back to beginning
            console.log("Loop all - restarting from beginning");
            set({ queueIndex: 0 });
            get().playTrack(queue[0]);
          } else {
            // No loop - stop playback
            console.log("End of queue - stopping playback");
            audio.pause();
            set({
              isPlaying: false,
              progress: 0,
              currentTime: 0,
            });
          }
        },

        // ================================
        // ⏮️ PLAY PREVIOUS TRACK (FIXED)
        // ================================
        playPrevious: () => {
          const { audio, queue, queueIndex, currentTrack } = get();

          console.log("playPrevious:", {
            queueLength: queue.length,
            queueIndex,
            currentTime: audio.currentTime,
          });

          // If track has been playing for more than 3 seconds, restart it
          if (audio.currentTime > 3) {
            console.log("Restarting current track (played >3s)");
            audio.currentTime = 0;
            set({ progress: 0, currentTime: 0 });
            return;
          }

          // No previous tracks available
          if (queueIndex <= 0) {
            console.log("No previous track available");
            // If we're at the first track, just restart it
            if (currentTrack) {
              audio.currentTime = 0;
              set({ progress: 0, currentTime: 0 });
            }
            return;
          }

          // Go to previous track
          const prevIndex = queueIndex - 1;
          console.log("Going to previous track at index:", prevIndex);
          set({ queueIndex: prevIndex });
          get().playTrack(queue[prevIndex]);
        },

        // ================================
        // 🗑️ REMOVE FROM QUEUE
        // ================================
        removeFromQueue: (index) => {
          const { queue, queueIndex, currentTrack, audio } = get();

          if (index < 0 || index >= queue.length) {
            console.warn("removeFromQueue: Index out of bounds");
            return;
          }

          const newQueue = queue.filter((_, i) => i !== index);
          const removedTrack = queue[index];

          let newQueueIndex = queueIndex;

          // Adjust queue index if we're removing the current or a previous track
          if (index < queueIndex) {
            newQueueIndex--;
          } else if (index === queueIndex) {
            // If removing current track, stop playback
            if (currentTrack?.videoId === removedTrack.videoId) {
              audio.pause();
              set({
                isPlaying: false,
                currentTrack: null,
                progress: 0,
                currentTime: 0,
              });
            }
            // If not the last track, move to same index (which will be next track)
            // If last track, set to -1
            newQueueIndex = index < newQueue.length ? index : -1;
          }

          set({
            queue: newQueue,
            queueIndex: newQueueIndex,
          });

          console.log(
            `Removed track from queue. New length: ${newQueue.length}`
          );

          // If we removed the current track and there's a new current track, play it
          if (index === queueIndex && newQueueIndex !== -1) {
            get().playTrack(newQueue[newQueueIndex]);
          }
        },

        // ================================
        // ▶ TOGGLE PLAY/PAUSE
        // ================================
        togglePlay: () => {
          const { audio, isPlaying, currentTrack } = get();

          if (!currentTrack) {
            console.warn("No track to play");
            return;
          }

          if (isPlaying) {
            audio.pause();
            set({ isPlaying: false });
          } else {
            audio
              .play()
              .then(() => {
                set({ isPlaying: true });
              })
              .catch(console.error);
          }
        },

        // ================================
        // ⏩ SEEK BAR
        // ================================
        seekTo: (percent) => {
          const { audio } = get();
          if (!audio.duration) return;

          const newTime = (percent / 100) * audio.duration;
          audio.currentTime = newTime;
          set({
            progress: percent,
            currentTime: newTime,
          });
        },

        seekToTime: (timeInSeconds) => {
          const { audio } = get();
          if (!audio.duration) return;

          const validTime = Math.max(
            0,
            Math.min(timeInSeconds, audio.duration)
          );
          audio.currentTime = validTime;
          set({
            currentTime: validTime,
            progress: audio.duration ? (validTime / audio.duration) * 100 : 0,
          });
        },

        // ================================
        // 🔊 VOLUME
        // ================================
        setVolume: (value) => {
          const { audio } = get();
          const vol = Math.max(0, Math.min(1, value / 100));
          audio.volume = vol;
          set({ volume: vol });
        },

        toggleMute: () => {
          const { audio, volume } = get();
          if (audio.volume > 0) {
            audio.volume = 0;
            set({ volume: 0 });
          } else {
            audio.volume = volume > 0 ? volume : 0.5;
            set({ volume: volume > 0 ? volume : 0.5 });
          }
        },

        // ================================
        // 🔄 SHUFFLE + LOOP
        // ================================
        toggleShuffle: () => {
          const newShuffle = !get().shuffle;
          set({ shuffle: newShuffle });
          console.log("Shuffle toggled:", newShuffle);
        },

        toggleLoop: () => {
          const { loop } = get();
          const newLoop =
            loop === "none" ? "one" : loop === "one" ? "all" : "none";

          set({ loop: newLoop });
          console.log("Loop mode:", newLoop);
        },

        // ================================
        // 🧹 CLEAR QUEUE
        // ================================
        clearQueue: () => {
          const { audio } = get();
          audio.pause();

          set({
            queue: [],
            queueIndex: -1,
            isPlaying: false,
            progress: 0,
            currentTime: 0,
          });

          console.log("Queue cleared");
        },

        // ================================
        // 📋 GET QUEUE INFO
        // ================================
        // Add this to your usePlayerStore return object:

        // ================================
        // 🎯 GET QUEUE INFO (IMPROVED)
        // ================================
        getQueueInfo: () => {
          const { queue, queueIndex, currentTrack } = get();

          // Handle case where queueIndex is -1 but we have currentTrack
          let actualIndex = queueIndex;
          let positionInQueue = queueIndex + 1;

          if (queueIndex === -1 && currentTrack) {
            // Try to find current track in queue
            const foundIndex = queue.findIndex(
              (track) => track.videoId === currentTrack.videoId
            );
            if (foundIndex !== -1) {
              actualIndex = foundIndex;
              positionInQueue = foundIndex + 1;
            }
          }

          return {
            currentTrack,
            currentIndex: actualIndex,
            nextTrack: queue[actualIndex + 1] || null,
            previousTrack: actualIndex > 0 ? queue[actualIndex - 1] : null,
            queueLength: queue.length,
            positionInQueue: positionInQueue,
          };
        },

        // ================================
        // 🎯 VALIDATE QUEUE STATE (NEW)
        // ================================
        validateQueueState: () => {
          const { queue, queueIndex, currentTrack } = get();

          // If we have a current track but invalid queue index, try to fix it
          if (currentTrack && queueIndex === -1 && queue.length > 0) {
            const foundIndex = queue.findIndex(
              (track) => track.videoId === currentTrack.videoId
            );
            if (foundIndex !== -1) {
              console.log("Fixed queue index:", foundIndex);
              set({ queueIndex: foundIndex });
              return true;
            }
          }

          return queueIndex !== -1 && queue.length > 0;
        },

        // ================================
        // 🔄 RESET PLAYER
        // ================================
        reset: () => {
          const { audio } = get();
          audio.pause();

          const freshAudio = new Audio();

          // Reattach event listeners
          freshAudio.addEventListener("loadedmetadata", () => {
            const { audio } = get();
            set({
              duration: audio.duration,
            });
          });

          freshAudio.addEventListener("timeupdate", () => {
            const { audio } = get();
            set({
              currentTime: audio.currentTime,
              progress: audio.duration
                ? (audio.currentTime / audio.duration) * 100
                : 0,
            });
          });

          freshAudio.addEventListener("ended", () => {
            get().playNext();
          });

          freshAudio.addEventListener("loadstart", () => {
            set({ isBuffering: true });
          });

          freshAudio.addEventListener("canplay", () => {
            set({ isBuffering: false });
          });

          freshAudio.addEventListener("error", (e) => {
            console.error("Audio error:", e);
            set({ isPlaying: false, isBuffering: false });
          });

          set({
            audio: freshAudio,
            currentTrack: null,
            isPlaying: false,
            isBuffering: false,
            progress: 0,
            currentTime: 0,
            duration: 0,
            queue: [],
            queueIndex: -1,
            volume: 1,
            shuffle: false,
            loop: "none",
          });

          console.log("Player reset");
        },
      };
    },
    {
      name: "player-storage",
      partialize: (state) => ({
        volume: state.volume,
        shuffle: state.shuffle,
        loop: state.loop,
        // Don't persist audio element or current playback state
      }),
    }
  )
);
