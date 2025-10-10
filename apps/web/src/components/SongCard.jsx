import { Card, CardContent } from "@/components/ui/card";

export function SongCard({ item }) {
  return (
    <Card className="bg-neutral-900 border-none hover:scale-[1.03] transition-all cursor-pointer rounded-2xl">
      <CardContent className="p-3">
        <img
          src={item.thumbnail}
          alt={item.title || item.name}
          className="w-full aspect-square object-cover rounded-xl"
        />
        <div className="pt-2">
          <p className="text-white font-medium truncate">{item.title || item.name}</p>
          {item.artist && <p className="text-gray-400 text-sm truncate">{item.artist}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
