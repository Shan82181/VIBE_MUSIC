import api from "@/lib/axios";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useLikedSongData } from "../hooks/useLikedSongsData";
const LikedButton = ({ song }) => {
  const { data } = useLikedSongData();
  const { user } = useUser();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (data?.likedSongs) {
      setLiked(data.likedSongs.some(item => item.videoId === song.videoId));
    }
  }, [data, song]);

  const onClick = async () => {
    if (!user) return;

    try {
      if (liked) {
        // unlike
        await api.post("/unliked", { userId: user.id, videoId: song.videoId });
        setLiked(false);
      } else {
        // like
        await api.post("/liked", {
          userId: user.id,
          videoId: song.videoId,
          title: song.title,
          thumbnail: song.thumbnail,
          duration: song.duration,
          artist: song.artist
        });
        setLiked(true);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  return (
    <button onClick={onClick}>
      <Heart
        className={`w-6 h-6 transition-colors duration-150 ${
          liked ? "text-red-500 fill-red-500" : "text-gray-400"
        }`}
      />
    </button>
  );
};
export default LikedButton;
