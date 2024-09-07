import JSZip from "jszip";
import { useEffect, useMemo, useState } from "react";
import { CbzViewer } from "../CbzViewer/CbzViewer";
import { EpubViewer } from "../EpubViewer/EpubViewer";

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
  const documentName = file.name.replace(/\.(\w+)$/i, "");

  if (!zip) {
    return <div>Loading...</div>;
  }

  const isEpub = file.name.toLowerCase().endsWith(".epub");

  if (isEpub) {
    return <EpubViewer zip={zip} onClose={onClose} />;
  }

  return (
    <CbzViewer
      lastPageIndexKey={lastPageIndexKey}
      zip={zip}
      documentName={documentName}
      onClose={onClose}
    />
  );
}