import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { usePlaylistData } from "@/hooks/usePlaylistData";
import SectionRenderer from "../../components/SectionRenderer";
import CategoryRenderer from "../../components/CategoryRenderer";

const NavigationPage = () => {
  const { browseId } = useParams();
  const [searchParams] = useSearchParams();
  const params = searchParams.get("params");

  const { data, isLoading, isError, error, refetch } =
    usePlaylistData(browseId, params);
//  console.log("NavigationPage Data:", data);
  // SAFE SECTIONS
  const sections = Array.isArray(data?.sections) ? data.sections : [];

  // LOADING
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    );

  // ERROR OR INVALID DATA
  if (isError || !data || typeof data !== "object") {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-400">
        <p className="mb-3">Failed to load page 😔</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="px-13 py-8 h-full overflow-y-auto no-scrollbar bg-black text-white">

      {sections.map((section, index) => {
        const items = Array.isArray(section.items) ? section.items : [];

        if (section.title === "Moods & moments" || section.title === "Genres") {
          return (
            <CategoryRenderer
              key={index}
              MainTitle={section.title}
              items={items}
            />
          );
        }

        return (
          <SectionRenderer
            key={index}
            MainTitle={section.title}
            items={items}
          />
        );
      })}

    </div>
  );
};

export default NavigationPage;
