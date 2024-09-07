import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "../ui/button";

export function HudPageButtons({ onChangePage }: { onChangePage: (delta: number) => void }) {
  return (
    <>
      <Button
        className="absolute top-1/2 left-0 group -translate-y-1/2 w-64 h-full max-h-[512px] hover:bg-black hover:bg-opacity-25 rounded-full"
        variant="ghost"
        onClick={() => onChangePage(-1)}>
        <ChevronLeftIcon className="text-white opacity-10 group-hover:opacity-50 size-32" />
      </Button>
      <Button
        className="absolute top-1/2 right-0 group -translate-y-1/2 w-64 h-full max-h-[512px] hover:bg-black hover:bg-opacity-25 rounded-full"
        variant="ghost"
        onClick={() => onChangePage(1)}>
        <ChevronRightIcon className="text-white opacity-10 group-hover:opacity-50 size-32" />
      </Button>
    </>
  );
}