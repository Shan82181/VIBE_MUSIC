// src/pages/Home/HomePage.jsx
import React from "react";
import { useHomeData } from "../../hooks/useHomeData";
import { Loader2 } from "lucide-react";
import SectionRendrer from "../../components/SectionRenderer";

export default function HomePage() {
  const { data, isLoading, isError, error, refetch } = useHomeData();

  const sections = Array.isArray(data?.sections) ? data.sections : [];

  // ⏳ Loading UI
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <Loader2 className="animate-spin mr-2" /> Loading home…
      </div>
    );

  // ❌ Error UI — but app continues running
  if (isError || !data || typeof data !== "object") {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-red-400">
        <p className="mb-3">Failed to load Home 😔</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ⭐ PREVENT CRASH even if sections is broken
  if (!Array.isArray(sections)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-red-400">
        <p>Invalid home data received.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md"
        >
          Reload
        </button>
      </div>
    );
  }

  // 🎶 Final Safe UI
  return (
    <div className="px-13 py-8 h-full overflow-y-auto no-scrollbar bg-black text-white">
      {sections.length === 0 ? (
        <div className="text-gray-400 text-center mt-20">No content available.</div>
      ) : (
        sections.map((section, index) => (
          <SectionRendrer
            key={index}
            MainTitle={section.title || "Untitled Section"}
            items={Array.isArray(section.items) ? section.items : []}
          />
        ))
      )}
    </div>
  );
}
