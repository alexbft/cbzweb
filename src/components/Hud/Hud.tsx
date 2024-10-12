import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

export type HudProps = PropsWithChildren<{
	hidden?: boolean;
}>;

export function Hud({ hidden, children }: HudProps) {
	return (
		<div
			className={cn(
				"fixed top-0 left-0 w-full h-full z-[1] pointer-events-none *:pointer-events-auto transition-transform duration-500 touch-none",
				hidden && "transform -translate-y-80",
			)}
		>
			{children}
		</div>
	);
}
