import {
	type ComponentProps,
	forwardRef,
	useImperativeHandle,
	useRef,
} from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type HudButtonProps = Omit<ComponentProps<typeof Button>, "variant">;

export const HudButton = forwardRef<HTMLButtonElement, HudButtonProps>(
	({ children, className, onClick, ...props }, ref) => {
		const buttonRef = useRef<HTMLButtonElement>(null);

		// biome-ignore lint/style/noNonNullAssertion: assigned below
		useImperativeHandle(ref, () => buttonRef.current!, []);

		return (
			<Button
				ref={buttonRef}
				className={cn(
					"group size-16 rounded-full text-gray-600 hover:bg-black/30 hover:text-black dark:text-gray-400 dark:hover:text-white",
					className,
				)}
				variant="ghost"
				onClick={(e) => {
					buttonRef.current?.blur();
					onClick?.(e);
				}}
				{...props}
			>
				<div className="">{children}</div>
			</Button>
		);
	},
);

HudButton.displayName = "HudButton";
