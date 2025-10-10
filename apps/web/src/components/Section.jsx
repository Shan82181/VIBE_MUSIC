import { SongCard } from "./SongCard";

export function Section({ title, items }) {
  if (!items?.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {items.map((item, i) => (
          <SongCard key={i} item={item} />
        ))}
      </div>
    </section>
  );
}
