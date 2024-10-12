import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { HudButton } from "../Hud/HudButton";

export function HudPageButtons({
	onChangePage,
}: { onChangePage: (delta: number) => void }) {
	return (
		<>
			<HudButton
				className="-translate-y-1/2 absolute top-1/2 left-0 h-full max-h-[512px] w-64"
				onClick={() => onChangePage(-1)}
			>
				<ChevronLeftIcon className="size-32 text-gray-600/25 group-hover:text-black dark:text-gray-400/25 dark:group-hover:text-white" />
			</HudButton>
			<HudButton
				className="-translate-y-1/2 absolute top-1/2 right-0 h-full max-h-[512px] w-64"
				onClick={() => onChangePage(1)}
			>
				<ChevronRightIcon className="size-32 text-gray-600/25 group-hover:text-black dark:text-gray-400/25 dark:group-hover:text-white" />
			</HudButton>
		</>
	);
}
