import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";

export function HudCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      className="absolute top-4 right-4 group size-16 hover:bg-black hover:bg-opacity-25 rounded-full"
      variant="ghost"
      onClick={onClick}>
      <Cross2Icon className="text-white opacity-30 group-hover:opacity-100 size-8" />
    </Button>
  );
}