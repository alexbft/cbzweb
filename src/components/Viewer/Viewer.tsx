import JSZip from "jszip";
import { useEffect, useMemo, useState } from "react";
import { PageLoader } from "../../helpers/PageLoader";
import { PageView } from "../PageView/PageView";

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

  return (
    zip ? <ViewerInternal zip={zip} /> : <div>Loading...</div>
  );
}

function ViewerInternal({ zip }: { zip: JSZip }) {
  const pageLoader = useMemo(() => {
    console.debug("initializing page loader");
    return new PageLoader(zip);
  }, [zip]);

  const [pageIndex, setPageIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      setImageUrl(null);
      const url = await pageLoader.getPage(pageIndex);
      setImageUrl(url);
    }

    loadPage();
  }, [pageIndex, pageLoader]);

  return imageUrl ? (
    <PageView
      imageUrl={imageUrl}
      onClick={() => {
        setPageIndex(pageIndex + 1);
      }}
    />
  ) : <div>{`Loading page ${pageIndex}...`}</div>;
}