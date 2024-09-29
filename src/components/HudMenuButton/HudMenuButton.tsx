import { ComponentProps, forwardRef } from "react";
import { Button } from "../ui/button";
import { MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type HudMenuButtonProps = Omit<ComponentProps<typeof Button>, 'variant'>;

export const HudMenuButton = forwardRef<HTMLButtonElement, HudMenuButtonProps>((props, ref) => {
  return (
    <Button
      ref={ref}
      className={cn("absolute top-4 left-6 group size-16 hover:bg-black hover:bg-opacity-25 rounded-full", props.className)}
      variant="ghost"
      {...props}
    >
      <MenuIcon className="text-white opacity-30 group-hover:opacity-100 size-8" />
    </Button>
  );
});