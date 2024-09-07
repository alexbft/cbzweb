import { PageInfo, PageLoader } from "@/helpers/PageLoader";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { Hud } from "../Hud/Hud";
import { HudCloseButton } from "../HudCloseButton/HudCloseButton";
import { Button } from "../ui/button";

export function PageView({ pageLoader, pageIndex, height, onChangePage, onClose }: {
  pageLoader: PageLoader;
  pageIndex: number;
  height: number;
  onChangePage: (delta: number) => void;
  onClose: () => void;
}) {
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPageInfo(null);
    pageLoader.getPage(pageIndex).then((pageInfo) => {
      if (!cancelled) {
        setPageInfo(pageInfo);
        setTimeout(() => {
          containerRef.current?.scrollTo(0, 0);
        }, 0);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pageLoader, pageIndex]);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const lastWidthRef = useRef(0);

  useEffect(() => {
    lastWidthRef.current = imageRef.current?.clientWidth ?? 0;
  });

  const toggleFullScreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    containerRef.current?.requestFullscreen();
  }, []);

  return (
    <main
      ref={containerRef}
      className="fixed top-0 left-0 w-screen h-screen grid place-items-center overflow-auto bg-[#39322B]"
      onWheel={(e) => {
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
          return;
        }
        const container = containerRef.current!;
        if (container.scrollHeight > container.clientHeight) {
          return;
        }
        onChangePage(e.deltaY > 0 ? 1 : -1);
      }}>
      <Hud>
        <HudCloseButton
          onClick={onClose} />
        <Button
          className="absolute top-1/2 left-0 group -translate-y-1/2 w-64 h-full max-h-[512px] hover:bg-black hover:bg-opacity-25 rounded-full"
          variant="ghost"
          onClick={() => onChangePage(-1)}>
          <ChevronLeftIcon className="text-white opacity-10 group-hover:opacity-50 size-32" />
        </Button>
        <Button
          className="absolute top-1/2 right-0 group -translate-y-1/2 w-64 h-full max-h-[512px] hover:bg-black hover:bg-opacity-25 rounded-full"
          variant="ghost"
          onClick={() => onChangePage(1)}>
          <ChevronRightIcon className="text-white opacity-10 group-hover:opacity-50 size-32" />
        </Button>
      </Hud>
      <div style={{ height }}>
        {pageInfo ? (
          <img
            ref={imageRef}
            className="w-auto h-full object-contain"
            src={pageInfo.imageUrl}
            alt={pageInfo.name}
            onDoubleClick={toggleFullScreen}

          />) : (
          <div className="h-full grid place-content-center" style={{ width: lastWidthRef.current }}>Loading page {pageIndex}...</div>
        )}
      </div>
    </main>
  );
}