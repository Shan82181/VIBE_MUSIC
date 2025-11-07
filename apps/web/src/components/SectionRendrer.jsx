import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
//import { usePlayer } from "@/context/PlayerContext";
import { usePlayerStore } from "@/store/usePlayerStore"; // ✅ new
import { useNavigate } from "react-router-dom";

const SectionRendrer = (props) => {
  const navigate = useNavigate();
  const handleBrowse = (browseId, params) => {
    navigate(
      `/playlist/${browseId}${
        params ? `?params=${encodeURIComponent(params)}` : ""
      }`
    );
  };
  const { MainTitle, items } = props;
  //const { playTrack } = usePlayer();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
 const handleItemClick = (item) => {
  if (item.type === "song" && item.videoId) {
    if (currentTrack?.videoId === item.videoId) {
      togglePlay(); // pause/resume if same song
    } else {
      playTrack(item);
    }
  } else if (
    ["playlist", "category", "album"].includes(item.type) &&
    item.browseId
  ) {
    handleBrowse(item.browseId, item.params);
  } else {
    console.warn("Unknown item type:", item);
  }
};

  if (!items || items.length === 0) return null;
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4 text-white">{MainTitle}</h2>

      <Carousel opts={{ align: "start", loop: false }} className="w-full">
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem
              key={index}
              className="basis-1/2 sm:basis-1/3 md:basis-1/5 lg:basis-1/6"
            >
              <Card className="bg-transparent border-none cursor-pointer hover:scale-[1.03] transition-transform duration-300 rounded-2xl">
                <CardContent
                  className="flex flex-col items-start w-full h-full p-0"
                  onClick={() => handleItemClick(item)}
                >
                  {/* ✅ Thumbnail section */}
                  <div className="w-full aspect-square rounded-xl overflow-hidden">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* ✅ Text section */}
                  <div className="mt-2 w-full px-1">
                    <p className="text-sm font-medium text-white truncate">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="text-xs text-gray-400 truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default SectionRendrer;
