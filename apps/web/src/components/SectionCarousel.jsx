import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

export default function SectionCarousel({ title, items}) {
  if (!items || items.length === 0) return null;
 //console.log(title);
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>

      <Carousel opts={{ align: "start", loop: true }} className="w-full">
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem
              key={index}
              className="basis-1/2 sm:basis-1/3 md:basis-1/5 lg:basis-1/6"
            >
              <Card
                
                className="bg-neutral-900 hover:bg-neutral-800 transition-all cursor-pointer rounded-2xl overflow-hidden"
              >
                <CardContent className="p-3 flex flex-col items-center">
                  {/* ✅ Fixed-size image container */}
                  <div className="w-full aspect-square relative overflow-hidden rounded-xl">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* ✅ Fixed text section */}
                  <p className="text-sm mt-2 text-center text-white line-clamp-2 h-[2.5rem]">
                    {item.title}
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
