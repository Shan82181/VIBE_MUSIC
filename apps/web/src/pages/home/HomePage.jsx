import { Loader2 } from "lucide-react";
import { Section } from "@/components/Section";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useHomeData } from "@/hooks/useHomeData";

export default function HomePage() {
  const { data, loading, error } = useHomeData();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-400">
        <Loader2 className="animate-spin mb-3" size={32} />
        <p>Loading your music experience...</p>
      </div>
    );
  }

  if (error) return <ErrorBoundary error={error} />;

  const { trending, playlists, featured, artists } = data;

  return (
    <main className="px-8 py-10 space-y-12 bg-[#0d0d0d] min-h-screen">
      <Section title="🔥 Trending Now" items={trending} />
      <Section title="💿 Playlists You Might Like" items={playlists} />
      <Section title="🌟 Featured" items={featured} />
      <Section title="👩‍🎤 Popular Artists" items={artists} />
    </main>
  );
}
