import { MenuIcon } from "lucide-react";
import { HudButton } from "../Hud/HudButton";

export function HudMenuButton({ onClick }: { onClick: () => void }) {
	return (
		<HudButton
			onClick={onClick}
			className="absolute top-0 left-0 md:top-4 md:left-6"
		>
			<MenuIcon className="size-8" />
		</HudButton>
	);
}
