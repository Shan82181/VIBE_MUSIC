// components/YouTubePlayerMount.jsx
import { useEffect } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";

const YouTubePlayerMount = () => {
  const initPlayer = usePlayerStore((s) => s.initPlayer);

  useEffect(() => {
    initPlayer();
  }, [initPlayer]);

  return <div id="video" style={{ display: "none" }} />;
};

export default YouTubePlayerMount;
