import { ComponentProps, forwardRef } from "react";
import { Button } from "../ui/button";
import { MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type HudMenuButtonProps = Omit<ComponentProps<typeof Button>, 'variant'>;

export const HudMenuButton = forwardRef<HTMLButtonElement, HudMenuButtonProps>((props, ref) => {
  return (
    <Button
      ref={ref}
      className={cn("absolute top-4 left-6 group size-16 rounded-full hover:bg-black/30", props.className)}
      variant="ghost"
      {...props}
    >
      <MenuIcon className="text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white size-8" />
    </Button>
  );
});