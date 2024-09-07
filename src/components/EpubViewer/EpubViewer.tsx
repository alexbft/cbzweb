import JSZip from "jszip";
import { Hud } from "../Hud/Hud";
import { HudCloseButton } from "../HudCloseButton/HudCloseButton";
import { useEffect, useState } from "react";
import { loadEpub } from "@/helpers/loadEpub";
import { EpubContent } from "@/helpers/EpubContent";
import { EpubContentView } from "./EpubContentView";

export function EpubViewer({ zip, lastPageIndexKey, onClose }: {
  zip: JSZip;
  lastPageIndexKey: IDBValidKey;
  onClose: () => void;
}) {
  const [content, setContent] = useState<EpubContent | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      try {
        const content = await loadEpub(zip);
        if (isCancelled) {
          content.dispose();
          return;
        }
        setContent(content);
      } catch (e) {
        console.error(e);
      }
    }

    load();

    return () => {
      isCancelled = true;
      setContent(null);
      content?.dispose();
    }
  }, [zip]);

  return (
    <main className="bg-[#39322B] h-screen text-gray-50 grid place-items-center">
      <Hud>
        <HudCloseButton onClick={onClose} />
      </Hud>
      {content ? (
        <EpubContentView content={content} lastPageIndexKey={lastPageIndexKey} />
      ) : (
        <div className="h-full aspect-[3/4] max-w-full">
          <div className="p-4">Loading...</div>
        </div>
      )}
    </main>
  );
}