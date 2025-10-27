import React from "react";
import { useHomeData } from "../../hooks/useHomeData";
import SectionCarousel from "../../components/SectionCarousel";
import { Loader2 } from "lucide-react";
import SectionRendrer from "../../components/SectionRendrer";

export default function HomePage() {
  const { data, loading, error } = useHomeData();
  const sections = data?.sections || [];
  console.log(sections);

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
      {/* {sections.map((section, index) => (
        <SectionCarousel
          key={index} 
          title={section.title}
          items={section.items}
        />
      ))} */}
      {sections.map((section, index) => (
        <SectionRendrer
          key={index} 
          MainTitle={section.title}
          items={section.items}
        />
      ))}
    </div>
  );
}
