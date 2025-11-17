import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { Heart } from "lucide-react";
import api from "@/lib/axios";

const LikedButton = ({ song }) => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // ⭐ Read global cache only — NO API CALL here
  const likedSongs = queryClient.getQueryData(["likedSongs", user?.id]) || [];

  const liked = likedSongs.some(item => item.videoId === song.videoId);

  const likeMutation = useMutation({
    mutationFn: () => api.post("/liked", {
      userId: user.id,
      videoId: song.videoId,
      title: song.title,
      thumbnail: song.thumbnail,
      duration: song.duration,
      artist: song.artist
    }),
    onSuccess: () => queryClient.invalidateQueries(["likedSongs", user.id])
  });

  const unlikeMutation = useMutation({
    mutationFn: () => api.post("/unliked", {
      userId: user.id,
      videoId: song.videoId
    }),
    onSuccess: () => queryClient.invalidateQueries(["likedSongs", user.id])
  });

  return (
    <button onClick={() => liked ? unlikeMutation.mutate() : likeMutation.mutate()}>
      <Heart
        className={`w-6 h-6 transition duration-150 ${
          liked ? "text-red-500 fill-red-500" : "text-gray-400"
        }`}
      />
    </button>
  );
};


export default LikedButton;
