import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

export type HudProps = PropsWithChildren<{
	hidden?: boolean;
}>;

export function Hud({ hidden, children }: HudProps) {
	return (
		<div
			className={cn(
				"pointer-events-none fixed top-0 left-0 z-[1] h-full w-full transition-transform duration-500 *:pointer-events-auto",
				hidden && "-translate-y-80 transform",
			)}
		>
			{children}
		</div>
	);
}
