import { PageInfo, PageLoader } from "@/helpers/PageLoader";
import { useEffect, useRef, useState } from "react";

export function PageView({ pageLoader, pageIndex, onChangePage, height }: {
  pageLoader: PageLoader;
  pageIndex: number;
  onChangePage: (delta: number) => void;
  height: number;
}) {
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPageInfo(null);
    pageLoader.getPage(pageIndex).then((pageInfo) => {
      if (!cancelled) {
        containerRef.current?.scrollTo(0, 0);
        setPageInfo(pageInfo);
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
      {pageInfo ? (
        <img
          className="w-auto mx-auto object-contain"
          style={{ height }}
          src={pageInfo.imageUrl}
          alt={pageInfo.name}
          onClick={() => onChangePage(1)}
        />) : (
        <div>Loading page {pageIndex}...</div>
      )}
    </div>
  );
}