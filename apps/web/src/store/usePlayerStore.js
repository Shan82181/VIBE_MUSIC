// src/store/usePlayerStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usePlayerStore = create(
  persist(
    (set, get) => {
      return {
        // ================================
        // 🔥 PLAYER STATE
        // ================================
        player: null, // The YouTube IFrame Player instance
        isReady: false, // Whether the player is initialized
        isBuffering: false, // Whether the player is buffering
        currentTrack: null,
        isPlaying: false, // Playing or paused
        isBuffering: false,
        progress: 0, // Percentage (0-100)
        progressTimer: null, // Interval timer for progress updates
        currentTime: 0, // Current time in seconds
        duration: 0, // Duration in seconds
        volume: 100, // Volume (0.0 to 1.0)

        // QUEUE SYSTEM
        queue: [],
        queueIndex: -1, // -1 means no track is selected
        shuffle: false,
        loop: "none", // "none" | "one" | "all"

        // ================================
        // 🎥 INIT YOUTUBE PLAYER (SINGLETON)
        // ================================
        initPlayer: () => {
          if (get().player) return;

          if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            document.body.appendChild(tag);
          }

          window.onYouTubeIframeAPIReady = () => {
            const ytPlayer = new window.YT.Player("video", {
              height: "0",
              width: "0",
              playerVars: {
                autoplay: 0,
                controls: 0,
                playsinline: 1,
              },
              events: {
                onReady: () => {
                  console.log("YouTube player ready!");
                  set({ player: ytPlayer, isReady: true });

                  // Set initial volume
                  setTimeout(() => {
                    ytPlayer.setVolume(get().volume);
                  }, 100);
                },
                onStateChange: (e) => {
                  const YTState = window.YT.PlayerState;

                  if (e.data === YTState.PLAYING) {
                    set({ isPlaying: true, isBuffering: false });
                    get().startProgressTimer();
                    setTimeout(() => {
                      const { player, volume } = get();
                      if (player && typeof player.setVolume === "function") {
                        player.setVolume(volume);
                      }
                    }, 50);
                  }

                  if (e.data === YTState.PAUSED) {
                    set({ isPlaying: false });
                  }

                  if (e.data === YTState.BUFFERING) {
                    set({ isBuffering: true });
                  }

                  if (e.data === YTState.ENDED) {
                    get().handleEnded();
                  }
                },
              },
            });
          };
        },

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
        // ▶ PLAY TRACK (GLOBAL) - FIXED VOLUME
        // ================================

        playTrack: (track) => {
          const { player, currentTrack, isPlaying, queue, volume } = get();

          if (!player) {
            console.warn("playTrack: Player not initialized yet. Skipping.");
            return;
          }

          if (!track || !track.videoId) {
            console.error("playTrack: Invalid track provided", track);
            return;
          }

          try {
            // Toggle play/pause if same track
            if (currentTrack?.videoId === track.videoId) {
              get().togglePlay();
              return;
            }

            // Clear any existing progress timer
            clearInterval(get().progressTimer);

            // Load the new video
            player.loadVideoById(track.videoId);

            // Set volume AFTER loading
            setTimeout(() => {
              if (player && typeof player.setVolume === "function") {
                player.setVolume(volume);
              }
            }, 100);

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

            // Start progress timer
            get().startProgressTimer();
          } catch (err) {
            console.error("Playback error:", err);
            set({ isPlaying: false, isBuffering: false });
          }
        },

        // ================================
        // ▶ SET QUEUE + START PLAY
        // ================================
        // ================================
        // ▶ SET QUEUE + START PLAY (WITH VOLUME FIX)
        // ================================
        setQueue: (tracks, startIndex = 0) => {
          if (!tracks || tracks.length === 0) {
            console.warn("setQueue: No tracks provided");
            return;
          }

          const { currentTrack, player, volume } = get();
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

          // Set volume before playing
          setTimeout(() => {
            if (player && typeof player.setVolume === "function") {
              player.setVolume(volume);
            }
          }, 100);

          // Only change audio if it's a different track
          if (!isSameTrack) {
            get().playTrack(startingTrack);
          } else {
            // Same track, just ensure it's playing and update queue context
            if (!get().isPlaying) {
              player.playVideo().catch(console.error);
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
          const { queue, queueIndex, shuffle, loop, player, currentTrack } =
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
            player.pauseVideo();
            set({ isPlaying: false });
            return;
          }

          // LOOP ONE - restart current track
          if (loop === "one" && currentTrack) {
            console.log("Loop one - restarting current track");
            player.getCurrentTime(0);
            player.playVideo().catch(console.error);
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
            player.pauseVideo();
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
          const { player, queue, queueIndex, currentTrack } = get();

          console.log("playPrevious:", {
            queueLength: queue.length,
            queueIndex,
            currentTime: player.getCurrentTime(),
          });

          // If track has been playing for more than 3 seconds, restart it
          if (player.getCurrentTime() > 3) {
            console.log("Restarting current track (played >3s)");
            player.seekTo(0, true);
            return;
          }

          // No previous tracks available
          if (queueIndex <= 0) {
            console.log("No previous track available");
            // If we're at the first track, just restart it
            if (currentTrack) {
              player.seekTo(0, true);
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
          const { queue, queueIndex, currentTrack, player } = get();

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
              player.pauseVideo();
              set({
                isPlaying: false,
                currentTrack: null,
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
          const { player, isPlaying, currentTrack } = get();

          if (!currentTrack) {
            console.warn("No track to play");
            return;
          }

          if (isPlaying) {
            player.pauseVideo();
            set({ isPlaying: false });
          } else {
            player.playVideo();
            set({ isPlaying: true });
          }
        },

        // ================================
        // ⏩ SEEK BAR
        // ================================
        seekTo: (percent) => {
          const { player } = get();
          const duration = player.getDuration();
          player.seekTo((percent / 100) * duration, true);
        },

        seekToTime: (seconds) => {
          const { player } = get();
          player.seekTo(seconds, true);
        },

        // ================================
        // 🔊 VOLUME
        // ================================
        setVolume: (value) => {
          const { player } = get();
          //const vol = Math.max(0, Math.min(100, value));
          player.setVolume(value);
          set({ volume: value });
        },

        toggleMute: () => {
          const { player, volume } = get();
          if (player.isMuted()) player.unMute();
          else player.mute();
          set({ volume: player.isMuted() ? 0 : volume });
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
          const { player } = get();
          player.pauseVideo();

          set({
            queue: [],
            queueIndex: -1,
            isPlaying: false,
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
        // 📊 PROGRESS TIMER
        // ================================
        startProgressTimer: () => {
          clearInterval(get().progressTimer);

          const timer = setInterval(() => {
            const { player } = get();
            if (!player) return;

            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();

            set({
              currentTime,
              duration,
              progress: duration ? (currentTime / duration) * 100 : 0,
            });
          }, 1000);

          set({ progressTimer: timer });
        },

        handleEnded: () => {
          clearInterval(get().progressTimer);
          get().playNext();
        },

        // ================================
        // 🔄 RESET PLAYER
        // ================================
        reset: () => {
          const { player } = get();
          player.pauseVideo();

          clearInterval(get().progressTimer);

          set({
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
