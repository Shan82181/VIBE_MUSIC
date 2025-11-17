import { useHomeData } from "../../hooks/useHomeData";
import { Loader2 } from "lucide-react";
import SectionRendrer from "../../components/SectionRendrer";

export default function HomePage() {
  const { data, isLoading, isError, error } = useHomeData();
  const sections = data?.sections || [];

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    );

  if (isError)
    return (
      <div className="text-center text-red-500 mt-10">
        Failed to load: {error}
      </div>
    );

  return (
    <div className="px-13 py-8 h-full overflow-y-auto no-scrollbar bg-black text-white">
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
