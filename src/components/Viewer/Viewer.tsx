import JSZip from "jszip";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageLoader } from "../../helpers/PageLoader";
import { PageView } from "../PageView/PageView";
import { get, set } from "idb-keyval";

export function Viewer({ file, onClose }: { file: File, onClose: () => void }) {
  const [zip, setZip] = useState<JSZip | null>(null);

  useEffect(() => {
    const openZip = async () => {
      setZip(null);
      console.debug("loading zip");
      const zip = await new JSZip().loadAsync(file);
      console.debug("loaded zip");
      setZip(zip);
    };

    openZip();
  }, [file]);

  const lastPageIndexKey = useMemo(() => ["lastPageIndex", file.name, file.size], [file]);
  const documentName = file.name.replace(/\.cbz$/i, "");

  return (
    zip ?
      <ViewerInternal
        lastPageIndexKey={lastPageIndexKey}
        zip={zip}
        documentName={documentName}
        onClose={onClose}
      />
      : <div>Loading...</div>
  );
}

function calculateImageHeight() {
  return window.innerHeight;
}

function ViewerInternal({ zip, lastPageIndexKey, documentName, onClose }:
  {
    zip: JSZip;
    lastPageIndexKey: IDBValidKey;
    documentName: string;
    onClose: () => void;
  }) {
  const pageLoader = useMemo(() => {
    return new PageLoader(zip);
  }, [zip]);

  const [pageIndex, setPageIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const lastPageIndex = await get<number>(lastPageIndexKey);
      setPageIndex(lastPageIndex ?? 0);
    })();
  }, [lastPageIndexKey]);

  useEffect(() => {
    if (pageIndex !== null) {
      set(lastPageIndexKey, pageIndex);
      document.title = `[${pageIndex + 1}/${pageLoader.numPages}] ${documentName} - CBZ Web Viewer`;
    }
  }, [pageIndex, lastPageIndexKey]);

  const [vh, setVh] = useState(calculateImageHeight());
  const prevDevicePixelRatio = useRef(0);

  useEffect(() => {
    function handleResize() {
      const newDevicePixelRatio = window.devicePixelRatio;
      if (newDevicePixelRatio === prevDevicePixelRatio.current) {
        // This is a normal resize event.
        setVh(calculateImageHeight());
      } else {
        // Keep image size if browser zoom changes, so the image is zoomed properly.
        prevDevicePixelRatio.current = newDevicePixelRatio;
      }
    }

    prevDevicePixelRatio.current = window.devicePixelRatio;
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    }
  }, []);

  const handlePageChange = useCallback((delta: number) => {
    const newPageIndex = pageIndex! + delta;
    if (newPageIndex < 0 || newPageIndex >= pageLoader.numPages) {
      return;
    }
    setPageIndex(newPageIndex);
  }, [pageIndex, pageLoader]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "PageUp":
          e.preventDefault();
          handlePageChange(-1);
          break;
        case "PageDown":
        case " ":
          e.preventDefault();
          handlePageChange(1);
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    }
  }, [pageIndex, pageLoader]);

  return pageIndex !== null ? (
    <PageView
      height={vh}
      pageLoader={pageLoader}
      pageIndex={pageIndex}
      onChangePage={handlePageChange}
      onClose={onClose}
    />
  ) : <div>Loading...</div>;
}