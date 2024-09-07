import JSZip from "jszip";
import { Hud } from "../Hud/Hud";
import { HudCloseButton } from "../HudCloseButton/HudCloseButton";

export function EpubViewer({ zip, onClose }: { zip: JSZip; onClose: () => void }) {
  return (
    <main className="bg-[#39322B] h-screen text-gray-50 grid place-items-center">
      <Hud>
        <HudCloseButton onClick={onClose} />
      </Hud>
      <div className="h-full aspect-[3/4] max-w-full">
        <div className="p-4">Hello Epub!</div>
      </div>
    </main>
  );
}