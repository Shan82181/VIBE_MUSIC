import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NavigationSection = React.memo(({ section }) => {
  //console.log("NavigationSection section prop:", section);
  const navigate = useNavigate();
  const items = section?.items || [];
  //console.log("NavigationSection items:", items);
  if (!items.length) return null;

  return (
    <div className="flex flex-wrap gap-4 justify-center items-center w-full mb-20">
      {items.map((item, index) => (
        <Button
          key={index}
          className="text-xl min-w-[140px] py-6 hover:bg-gray-800 transition-colors"
          onClick={() =>
            navigate(
              item.params
                ? `/navigation/${item.browseId}?params=${item.params}`
                : `/navigation/${item.browseId}`
            )
          }
        >
          {item.title}
        </Button>
      ))}
    </div>
  );
});

export default NavigationSection;
