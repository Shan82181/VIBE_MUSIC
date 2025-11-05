import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { usePlaylistData } from "@/hooks/usePlaylistData";
import SectionRendrer from "../../components/SectionRendrer";
import CategoryRenderer from "../../components/CategoryRenderer";

const NavigationPage = () => {
  const { browseId } = useParams();
  const [searchParams] = useSearchParams();
  const params = searchParams.get("params");
  const { data, loading, error } = usePlaylistData(browseId, params);
  const sections = data?.sections || [];
  // console.log(data)

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-white">
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
      {sections.map((section, index) => {
        if (section.title ===  "Moods & moments" || section.title ===  "Genres") {
          // render your custom UI here
          return (
            <CategoryRenderer key={index} MainTitle={section.title} items={section.items} />
          );
        }

        // Default renderer for all other sections
        return (
          <SectionRendrer
            key={index}
            MainTitle={section.title}
            items={section.items}
          />
        );
      })}
    </div>
  );
};

export default NavigationPage;
