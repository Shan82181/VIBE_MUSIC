import React from "react";
import { useExploreData } from "../../hooks/useExploreData"; 
import { Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import SectionRendrer from "../../components/SectionRendrer";
import CategoryRenderer from "../../components/CategoryRenderer";

const ExplorePage = () => {
  const { data, loading, error } = useExploreData();
  const Navigation =
    data?.sections?.filter((s) => s.title === "Navigation") || [];

  const NewAlbumsSingles =
    data?.sections?.filter((s) => s.title === "New albums & singles") || [];
  const MoodsGenres =
    data?.sections?.filter((s) => s.title === "Moods & genres") || [];
  const Trending = data?.sections?.filter((s) => s.title === "Trending") || [];
  const NewMusicVideos =
    data?.sections?.filter((s) => s.title === "New music videos") || [];

  // console.log(NewMusicVideos);
  const handlePlay = (track) => {
    console.log("Play:", track.title, track.videoId);
    // TODO: integrate with your global player context
  };

  const handleOpenPlaylist = (playlist) => {
    console.log("Open Playlist:", playlist.browseId);
    // TODO: navigate(`/playlist/${playlist.browseId}`)
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen  text-white">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 mt-10">
        Failed to load: {error}
      </div>
    );
  return (
    <div className="px-13 py-8 h-full overflow-y-auto no-scrollbar bg-black text-white">
      <NavigationSection navigation={Navigation}/>
      <NewAlbumsSinglesSection newAlbumsSingles={NewAlbumsSingles} />
      <MoodsGenresSection MoodsGenres={MoodsGenres} />
      <TrendingSection Trending={Trending} />
    </div>
  );
};

export default ExplorePage;

const NavigationSection = (props) => {
  const { navigation } = props;
  const items = navigation[0]?.items || [];
  //const browseId = navigation[0]?.browseId || "";
  //console.log(items);
  const handleOnClick = (browseId) => {
    console.log("Navigate to:", browseId);
  };
  return (
    <div className="flex flex-wrap gap-4 justify-center items-center w-full mb-20">
      {items.map((item, index) => (
        <Button
          onClick={() => handleOnClick(item.browseId)}
          key={index}
          className="text-2xl flex-1 min-w-[100px] sm:min-w-[150px] py-6 hover:bg-gray-800 transition-colors"
        >
          {item.title}
        </Button>
      ))}
    </div>
  );
};
const NewAlbumsSinglesSection = (props) => {
  const { newAlbumsSingles } = props;
  const MainTitle = newAlbumsSingles[0]?.title || "";
  //console.log(MainTitle);
  const items = newAlbumsSingles[0]?.items || [];
  //console.log(items);
  return(<SectionRendrer MainTitle={MainTitle} items={items} />)
};
const MoodsGenresSection = (props) => {
  const { MoodsGenres } = props;
  const MainTitle = MoodsGenres[0]?.title || "";
  const items = MoodsGenres[0]?.items || [];
  return(<CategoryRenderer MainTitle={MainTitle} items={items} />)
}
const TrendingSection = (props) => {
  const { Trending } = props;
  const MainTitle = Trending[0]?.title || "";
  const items = Trending[0]?.items || [];
  return(<SectionRendrer MainTitle={MainTitle} items={items} />)
}