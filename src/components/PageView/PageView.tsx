import { PageLoader } from "@/helpers/PageLoader";
import { useEffect, useRef, useState } from "react";

export function PageView({ pageLoader, pageIndex, onChangePage, height }: {
  pageLoader: PageLoader;
  pageIndex: number;
  onChangePage: (delta: number) => void;
  height: number;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setImageUrl(null);
    pageLoader.getPage(pageIndex).then((url) => {
      if (!cancelled) {
        setImageUrl(url ?? '!ERROR');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pageLoader, pageIndex]);

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-screen h-screen overflow-auto bg-[#39322B]"
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
      {(() => {
        switch (imageUrl) {
          case null:
            return <div>Loading page {pageIndex}...</div>;
          case '!ERROR':
            return <div>Error loading page {pageIndex}</div>;
          default:
            return <img
              className="w-auto mx-auto"
              style={{ height }}
              src={imageUrl}
              onClick={() => onChangePage(1)}
            />;
        }
      })()}
    </div>
  );
}