import { PageInfo, PageLoader } from "@/helpers/PageLoader";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Cross2Icon, ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

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
        containerRef.current?.scrollTo(0, 0);
        setPageInfo(pageInfo);
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

  return (
    <div
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
      <div className="absolute top-0 left-0 w-full h-full z-[1] pointer-events-none *:pointer-events-auto">
        <Button
          className="absolute top-4 right-4 group size-16 hover:bg-black hover:bg-opacity-25 rounded-full"
          variant="ghost"
          onClick={onClose}>
          <Cross2Icon className="text-white opacity-30 group-hover:opacity-100 size-8" />
        </Button>
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
      </div>
      <div style={{ height }}>
        {pageInfo ? (
          <img
            ref={imageRef}
            className="w-auto h-full object-contain"
            src={pageInfo.imageUrl}
            alt={pageInfo.name}
          />) : (
          <div className="h-full grid place-content-center" style={{ width: lastWidthRef.current }}>Loading page {pageIndex}...</div>
        )}
      </div>
    </div>
  );
}