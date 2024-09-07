import JSZip from "jszip";

export interface EpubManifestItem {
  id: string;
  href: string;
  title: string;
  mediaType: string;
  zipEntry: JSZip.JSZipObject;
}