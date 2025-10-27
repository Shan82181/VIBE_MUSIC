import React from "react";
import { Button } from "@/components/ui/button";
const CategoryRenderer = (props) => {
  const { MainTitle, items } = props;
  return (
    <div className="mb-10">
  <h2 className="text-2xl font-semibold mb-4 text-white">{MainTitle}</h2>

  <div className="grid grid-flow-col auto-cols-[160px] grid-rows-4 overflow-x-scroll gap-3">
    {items.map((item, index) => (
      <Button
        key={index}
        className="w-full h-full bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium 
                   rounded-xl flex items-start justify-start text-left px-4 py-3 transition-all"
      >
        {item.title}
      </Button>
    ))}
  </div>
</div>

  );
};

export default CategoryRenderer;
