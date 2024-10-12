import { Cross2Icon } from "@radix-ui/react-icons";
import { HudButton } from "../Hud/HudButton";

export function HudCloseButton({ onClick }: { onClick: () => void }) {
	return (
		<HudButton onClick={onClick} className="absolute top-4 right-6">
			<Cross2Icon className="size-8" />
		</HudButton>
	);
}
