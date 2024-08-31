import JSZip from "jszip";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageLoader } from "../../helpers/PageLoader";
import { PageView } from "../PageView/PageView";
import { get, set } from "idb-keyval";

export function Viewer({ file }: { file: File }) {
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

  return (
    zip ? <ViewerInternal lastPageIndexKey={lastPageIndexKey} zip={zip} /> : <div>Loading...</div>
  );
}

function calculateImageHeight() {
  return window.innerHeight;
}

function ViewerInternal({ zip, lastPageIndexKey }: { zip: JSZip; lastPageIndexKey: IDBValidKey }) {
  const pageLoader = useMemo(() => {
    console.debug("initializing page loader");
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

  const handlePageChange = (delta: number) => {
    const newPageIndex = pageIndex! + delta;
    if (newPageIndex < 0 || newPageIndex >= pageLoader.numPages) {
      return;
    }
    setPageIndex(newPageIndex);
  };

  return pageIndex !== null ? (
    <PageView
      height={vh}
      pageLoader={pageLoader}
      pageIndex={pageIndex}
      onChangePage={handlePageChange}
    />
  ) : <div>'Loading...'</div>;
}