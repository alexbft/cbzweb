import { useMemo, use, useState } from "react";
import JSZip from "jszip";

export function Viewer({ file }: { file: File }) {
  const zipPromise = useMemo(() => {
    const result = new JSZip();
    return result.loadAsync(file);
  }, [file]);
  const zip = use(zipPromise);

  const pages = useMemo(() => {
    console.debug("loading pages");
    return Object.values(zip.files)
      .filter(obj => !obj.dir);
  }, [zip]);

  const [pageIndex, setPageIndex] = useState(0);

  const pagePromise = useMemo(() => {
    return zip.file(pages[pageIndex].name)?.async("blob");
  }, [zip, pageIndex]);
  const page = pagePromise ? use(pagePromise) : null;

  return page ? (
    <img
      src={URL.createObjectURL(page)}
      onClick={() => {
        setPageIndex(pageIndex + 1);
      }}
    />
  ) : <div>Page not found</div>;
}