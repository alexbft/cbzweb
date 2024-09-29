import JSZip from "jszip";
import { Hud } from "../Hud/Hud";
import { HudCloseButton } from "../HudCloseButton/HudCloseButton";
import { useEffect, useRef, useState } from "react";
import { loadEpub } from "@/helpers/loadEpub";
import { EpubContent } from "@/helpers/EpubContent";
import { EpubContentView, EpubViewController } from "./EpubContentView";
import { HudMenuButton } from "../HudMenuButton/HudMenuButton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Sidebar } from "./Sidebar";

export function EpubViewer({ zip, lastPageIndexKey, onClose }: {
  zip: JSZip;
  lastPageIndexKey: IDBValidKey;
  onClose: () => void;
}) {
  const [content, setContent] = useState<EpubContent | null>(null);

  const [hudHidden, setHudHidden] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const controllerRef = useRef<EpubViewController | null>(null);

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

  function handleScroll(verticalDirection: number) {
    setHudHidden(verticalDirection >= 0);
  }

  return (
    <main className="bg-[#39322B] h-screen text-gray-50 grid place-items-center">
      <Hud hidden={hudHidden}>
        <Sheet modal={false} open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <HudMenuButton />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[400px] bg-black/50 text-white"
            aria-describedby={undefined}
            overlay={
              <div className="fixed inset-0" />
            }>
            <SheetHeader>
              <VisuallyHidden asChild>
                <SheetTitle className="text-white">Epub Viewer</SheetTitle>
              </VisuallyHidden>
            </SheetHeader>
            <Sidebar />
          </SheetContent>
        </Sheet>
        <HudCloseButton onClick={onClose} />
      </Hud>
      {content ? (
        <EpubContentView
          controllerRef={controllerRef}
          content={content}
          lastPageIndexKey={lastPageIndexKey}
          onScroll={handleScroll} />
      ) : (
        <div className="h-full aspect-[3/4] max-w-full">
          <div className="p-4">Loading...</div>
        </div>
      )}
    </main>
  );
}