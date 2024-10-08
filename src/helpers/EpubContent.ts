import { EpubManifestItem } from "@/types/EpubManifestItem";
import { EpubPage } from "./EpubPage";
import { dirName } from "./dirName";
import { resolvePath } from "./resolvePath";

export type EpubContentOptions = {
  title: string;
  manifestItems: EpubManifestItem[];
  readingOrder: string[];
  tocItemIds: string[];
};

export class EpubContent {
  private readonly itemById = new Map<string, EpubManifestItem>();
  private readonly itemByHref = new Map<string, EpubManifestItem>();
  private readonly objectUrlCache = new Map<string, string>();

  private readonly readingOrder: string[];
  private readonly tocItemIds: string[];
  public readonly title: string;

  constructor({ manifestItems, readingOrder, title, tocItemIds }: EpubContentOptions) {
    this.readingOrder = readingOrder;
    this.tocItemIds = tocItemIds;
    this.title = title;
    for (const item of manifestItems) {
      this.itemById.set(item.id, item);
      this.itemByHref.set(item.href, item);
    }
  }

  get numPages() {
    return this.readingOrder.length;
  }

  async getPage(index: number): Promise<EpubPage> {
    if (index < 0 || index >= this.readingOrder.length) {
      throw new Error("Page not found");
    }
    const itemId = this.readingOrder[index];
    const item = this.itemById.get(itemId);
    if (!item) {
      throw new Error("Item not found");
    }
    if (item.mediaType !== "application/xhtml+xml") {
      throw new Error(`Unsupported media type: ${item.mediaType}`);
    }
    const xhtml = await item.zipEntry.async("text");
    const pageDocument = new DOMParser().parseFromString(xhtml, "application/xhtml+xml");
    const resolveTasks: Promise<void>[] = [];

    const images = pageDocument.querySelectorAll("img");
    for (const image of images) {
      const path = image.getAttribute("src");
      if (path != null) {
        const imageItem = this.resolveItemByRelativePath(item.href, path);
        if (imageItem) {
          resolveTasks.push(this.getObjectUrl(imageItem).then(url => {
            image.setAttribute("src", url);
          }));
        }
      }
    }

    const svgImages = pageDocument.querySelectorAll("image");
    for (const image of svgImages) {
      const path = image.getAttribute("xlink:href");
      if (path != null) {
        const imageItem = this.resolveItemByRelativePath(item.href, path);
        if (imageItem) {
          resolveTasks.push(this.getObjectUrl(imageItem).then(url => {
            image.setAttribute("xlink:href", url);
          }));
        }
      }
    }

    const cssLinks = pageDocument.querySelectorAll("link[rel=stylesheet]");
    for (const link of cssLinks) {
      const path = link.getAttribute("href");
      if (path != null) {
        const cssItem = this.resolveItemByRelativePath(item.href, path);
        if (cssItem) {
          resolveTasks.push(this.getStylesheetUrl(cssItem).then(url => {
            link.setAttribute("href", url);
          }));
        }
      }
    }

    const links = pageDocument.querySelectorAll("a");
    for (const link of links) {
      const path = link.getAttribute("href");
      if (path != null) {
        const linkTo = this.resolveItemByRelativePath(item.href, path);
        if (linkTo) {
          const parts = path.split("#", 2);
          let href = `#book/${linkTo.href}`;
          if (parts.length === 2) {
            href += `#${parts[1]}`;
          }
          link.setAttribute("href", href);
        } else {
          link.setAttribute("target", "_parent");
        }
      }
    }

    await Promise.all(resolveTasks);

    return {
      id: itemId,
      href: item.href,
      title: item.title,
      documentElement: pageDocument.documentElement,
    } satisfies EpubPage;
  }

  get toc() {
    return this.tocItemIds
      .map(id => this.itemById.get(id))
      .filter(Boolean) as EpubManifestItem[];
  }

  private async getObjectUrl(item: EpubManifestItem, transformContent?: (content: string) => Promise<string> | string) {
    let cachedUrl = this.objectUrlCache.get(item.id);
    if (cachedUrl) {
      return cachedUrl;
    }
    let content: Blob | string;
    if (transformContent) {
      content = await Promise.resolve(transformContent(await item.zipEntry.async("text")));
    } else {
      content = await item.zipEntry.async("blob");
    }
    cachedUrl = this.objectUrlCache.get(item.id);
    if (cachedUrl) {
      return cachedUrl;
    }
    const typedBlob = new Blob([content], { type: item.mediaType });
    const url = URL.createObjectURL(typedBlob);
    this.objectUrlCache.set(item.id, url);
    return url;
  }

  private async getStylesheetUrl(item: EpubManifestItem) {
    return this.getObjectUrl(item, async (content) => {
      const urls: Set<string> = new Set();
      for (const match of content.matchAll(urlRegex)) {
        urls.add(match[1]);
      }
      const resolvedUrls = await Promise.all(Array.from(urls).map(async url => {
        const resolvedItem = this.resolveItemByRelativePath(item.href, url);
        const resolvedUrl = resolvedItem ? await this.getObjectUrl(resolvedItem) : url;
        return [url, resolvedUrl] as [string, string];
      }));
      const urlMap = new Map(resolvedUrls);
      return content.replaceAll(urlRegex, (_, path) => {
        return `url("${urlMap.get(path) ?? path}")`;
      });
    });
  }

  private resolveItemByRelativePath(basePath: string, relativePath: string) {
    let endPath = relativePath.split("#", 2)[0];
    const resolvedPath = resolvePath(dirName(basePath), endPath);
    return this.itemByHref.get(resolvedPath);
  }

  dispose() {
    for (const url of this.objectUrlCache.values()) {
      URL.revokeObjectURL(url);
    }
    this.objectUrlCache.clear();
  }
}

const urlRegex = /url\(['"]?(.+?)['"]?\)/g;