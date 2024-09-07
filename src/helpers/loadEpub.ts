import { EpubManifestItem } from "@/types/EpubManifestItem";
import { EpubManifestItemNode } from "@/types/EpubManifestItemNode";
import { XMLParser } from "fast-xml-parser";
import JSZip from "jszip";
import { dirName } from "./dirName";
import { EpubContent } from "./EpubContent";
import { nodeToArray } from "./nodeToArray";
import { resolvePath } from "./resolvePath";

export async function loadEpub(zip: JSZip) {
  const containerXmlText = await zip.file("META-INF/container.xml")?.async("text");
  if (!containerXmlText) {
    throw new Error("container.xml not found");
  }
  const xmlParser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
  const containerXml = xmlParser.parse(containerXmlText, true);
  const rootPath = containerXml.container.rootfiles.rootfile["@_full-path"] as string;
  const rootXmlText = await zip.file(rootPath)?.async("text");
  if (!rootXmlText) {
    throw new Error("rootfile not found");
  }
  const basePath = dirName(rootPath);
  const rootXml = xmlParser.parse(rootXmlText, true);
  const bookTitle = rootXml.package.metadata.title.toString();
  const manifestItems = nodeToArray<EpubManifestItemNode>(rootXml.package.manifest.item).map(node => {
    const href = resolvePath(basePath, node["@_href"]);
    const zipEntry = zip.file(href);
    if (!zipEntry) {
      throw new Error(`File not found: ${href}`);
    }
    return {
      id: node["@_id"],
      href: href,
      title: "",
      mediaType: node["@_media-type"],
      zipEntry: zipEntry,
    } satisfies EpubManifestItem;
  });
  const readingOrder = nodeToArray(rootXml.package.spine.itemref).map(node => node["@_idref"] as string);
  const tocItemId = rootXml.package.spine["@_toc"] as string;
  const tocItem = manifestItems.find(item => item.id === tocItemId);
  if (!tocItem) {
    throw new Error("TOC item not found");
  }
  const tocXmlText = await tocItem.zipEntry.async("text");
  if (!tocXmlText) {
    throw new Error("TOC file not found");
  }
  const tocXml = xmlParser.parse(tocXmlText, true);
  const navPoints = nodeToArray(tocXml.ncx.navMap.navPoint);
  const manifestItemById = new Map(manifestItems.map(item => [item.id, item]));
  const manifestItemByHref = new Map(manifestItems.map(item => [item.href, item]));
  for (const navPoint of navPoints) {
    const navLabel = navPoint.navLabel.text;
    if (typeof navLabel !== "string") {
      continue;
    }
    const relativePath = navPoint.content["@_src"] as string;
    const href = resolvePath(dirName(tocItem.href), relativePath);
    const manifestItem = manifestItemByHref.get(href);
    if (manifestItem) {
      manifestItem.title = navLabel;
    }
  }
  let prevTitle = "";
  for (const id of readingOrder) {
    const item = manifestItemById.get(id);
    if (item) {
      if (item.title === "") {
        item.title = prevTitle;
      } else {
        prevTitle = item.title;
      }
    }
  }
  return new EpubContent({ manifestItems, readingOrder, title: bookTitle });
}