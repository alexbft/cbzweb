import { PageInfo, PageLoader } from "@/helpers/PageLoader";
import { useCallback, useEffect, useRef, useState } from "react";
import { Hud } from "../Hud/Hud";
import { HudCloseButton } from "../HudCloseButton/HudCloseButton";
import { HudPageButtons } from "../HudPageButtons/HudPageButtons";

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
    let success = false;
    setTimeout(() => {
      if (!success) {
        setPageInfo(null);
      }
    }, 0);
    pageLoader.getPage(pageIndex).then((pageInfo) => {
      if (!cancelled) {
        success = true;
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
    document.body.requestFullscreen();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-screen h-screen grid place-items-center overflow-auto"
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
        <HudCloseButton onClick={onClose} />
        <HudPageButtons onChangePage={onChangePage} />
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
    </div>
  );
}