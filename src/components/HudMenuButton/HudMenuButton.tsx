import { MenuIcon } from "lucide-react";
import { HudButton } from "../Hud/HudButton";
import { forwardRef } from "react";

export type HudMenuButtonProps = {
	onClick?: () => void;
};

export const HudMenuButton = forwardRef<HTMLButtonElement, HudMenuButtonProps>(
	({ onClick }, ref) => {
		return (
			<HudButton
				ref={ref}
				onClick={onClick}
				className="absolute top-0 left-0 md:top-4 md:left-6"
			>
				<MenuIcon className="size-8" />
			</HudButton>
		);
	},
);

HudMenuButton.displayName = "HudMenuButton";
