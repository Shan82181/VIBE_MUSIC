import React, { useMemo } from "react";
import { useExploreData } from "../../hooks/useExploreData";
import { Loader2 } from "lucide-react";
import SectionRenderer from "../../components/SectionRenderer";
import CategoryRenderer from "../../components/CategoryRenderer";
import NavigationSection from "../../components/Explore/NavigationSection";

const ExplorePage = () => {
  const { data, isLoading, isError, error, refetch } = useExploreData();

  // 🔒 SAFE fallback for sections
  const sections = Array.isArray(data?.sections) ? data.sections : [];

  const sectionMap = useMemo(() => {
    const map = {};
    sections.forEach((s) => (map[s.title] = s));
    return map;
  }, [sections]);

  // ⏳ LOADING UI
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <Loader2 className="animate-spin mr-2" /> Loading Explore...
      </div>
    );

  // ❌ ERROR UI (no black screen)
  if (isError || !data || typeof data !== "object") {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-red-400">
        <p className="mb-3">Failed to load Explore page 😔</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="px-13 py-8 h-full overflow-y-auto no-scrollbar bg-black text-white">
      <NavigationSection section={sectionMap["Navigation"]} />

      <SectionRenderer
        MainTitle="New albums & singles"
        items={sectionMap["New albums & singles"]?.items}
      />

      <CategoryRenderer
        MainTitle="Moods & genres"
        items={sectionMap["Moods & genres"]?.items}
      />

      <SectionRenderer
        MainTitle="Trending"
        items={sectionMap["Trending"]?.items}
      />
    </div>
  );
};

export default ExplorePage;
