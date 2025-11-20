// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useUser } from "@clerk/clerk-react";
// import { Heart } from "lucide-react";
// import api from "@/lib/axios";

// const LikedButton = ({ song }) => {
//   const { user } = useUser();
//   const queryClient = useQueryClient();

//   // ⭐ Read global cache only — NO API CALL here
//   const likedSongs = queryClient.getQueryData(["likedSongs", user?.id]) || [];

//   const liked = likedSongs.some(item => item.videoId === song.videoId);

//   const likeMutation = useMutation({
//     mutationFn: () => api.post("/liked", {
//       userId: user.id,
//       videoId: song.videoId,
//       title: song.title,
//       thumbnail: song.thumbnail,
//       duration: song.duration,
//       artist: song.artist
//     }),
//     onSuccess: () => queryClient.invalidateQueries(["likedSongs", user.id])
//   });

//   const unlikeMutation = useMutation({
//     mutationFn: () => api.post("/unliked", {
//       userId: user.id,
//       videoId: song.videoId
//     }),
//     onSuccess: () => queryClient.invalidateQueries(["likedSongs", user.id])
//   });

//   return (
//     <button onClick={() => liked ? unlikeMutation.mutate() : likeMutation.mutate()}>
//       <Heart
//         className={`w-6 h-6 transition duration-150 ${
//           liked ? "text-red-500 fill-red-500" : "text-gray-400"
//         }`}
//       />
//     </button>
//   );
// };

// export default LikedButton;

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { Heart } from "lucide-react";
import api from "@/lib/axios";

const LikedButton = ({ song }) => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Get current liked songs from cache
  const cache = queryClient.getQueryData(["likedSongs", user?.id]);

  const likedSongs = Array.isArray(cache) ? cache : [];
  const isLiked = likedSongs.some((s) => s.videoId === song.videoId);

  // ⭐ OPTIMISTIC LIKE
  const likeMutation = useMutation({
    mutationFn: () =>
      api.post("/liked", {
        userId: user.id,
        ...song,
      }),

    // Immediately update UI — BEFORE calling backend
    onMutate: async () => {
      await queryClient.cancelQueries(["likedSongs", user.id]);

      const prev = queryClient.getQueryData(["likedSongs", user.id]) || [];

      queryClient.setQueryData(["likedSongs", user.id], [...prev, song]);

      return { prev };
    },

    // If backend fails → rollback
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(["likedSongs", user.id], ctx.prev);
    },

    // Sync with server result
    onSettled: () => {
      queryClient.invalidateQueries(["likedSongs", user.id]);
    },
  });

  // ⭐ OPTIMISTIC UNLIKE
  const unlikeMutation = useMutation({
    mutationFn: () =>
      api.post("/unliked", {
        userId: user.id,
        videoId: song.videoId,
      }),

    onMutate: async () => {
      await queryClient.cancelQueries(["likedSongs", user.id]);

      const prev = queryClient.getQueryData(["likedSongs", user.id]) || [];

      queryClient.setQueryData(
        ["likedSongs", user.id],
        prev.filter((s) => s.videoId !== song.videoId)
      );

      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(["likedSongs", user.id], ctx.prev);
    },

    onSettled: () => {
      queryClient.invalidateQueries(["likedSongs", user.id]);
    },
  });

  return (
    <button
      onClick={() =>
        isLiked ? unlikeMutation.mutate() : likeMutation.mutate()
      }
      className="transition-transform hover:scale-110 active:scale-90"
    >
      <Heart
        className={`w-6 h-6 transition-all duration-200 ${
          isLiked
            ? "text-red-500 fill-red-500 scale-110"
            : "text-gray-400 scale-100"
        }`}
      />
    </button>
  );
};

export default LikedButton;
