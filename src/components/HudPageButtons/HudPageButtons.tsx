import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "../ui/button";

export function HudPageButtons({ onChangePage }: { onChangePage: (delta: number) => void }) {
  return (
    <>
      <Button
        className="absolute top-1/2 left-0 group -translate-y-1/2 w-64 h-full max-h-[512px] hover:bg-black/30 rounded-full"
        variant="ghost"
        onClick={() => onChangePage(-1)}>
        <ChevronLeftIcon className="text-gray-600/25 dark:text-gray-400/25 group-hover:text-black dark:group-hover:text-white size-32" />
      </Button>
      <Button
        className="absolute top-1/2 right-0 group -translate-y-1/2 w-64 h-full max-h-[512px] hover:bg-black/30 rounded-full"
        variant="ghost"
        onClick={() => onChangePage(1)}>
        <ChevronRightIcon className="text-gray-600/25 dark:text-gray-400/25 group-hover:text-black dark:group-hover:text-white size-32" />
      </Button>
    </>
  );
}