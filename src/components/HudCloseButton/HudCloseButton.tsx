import { ComponentProps, forwardRef } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Cross2Icon } from "@radix-ui/react-icons";

type HudCloseButtonProps = Omit<ComponentProps<typeof Button>, 'variant'>;

export const HudCloseButton = forwardRef<HTMLButtonElement, HudCloseButtonProps>((props, ref) => {
  return (
    <Button
      ref={ref}
      className={cn("absolute top-4 right-6 group size-16 rounded-full hover:bg-black/30", props.className)}
      variant="ghost"
      {...props}
    >
      <Cross2Icon className="text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white size-8" />
    </Button>
  );
});