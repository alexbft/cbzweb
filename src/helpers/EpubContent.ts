import { EpubManifestItem } from "@/types/EpubManifestItem";
import { EpubPage } from "./EpubPage";
import { dirName } from "./dirName";
import { resolvePath } from "./resolvePath";

export type EpubContentOptions = {
  title: string;
  manifestItems: EpubManifestItem[];
  readingOrder: string[];
};

export class EpubContent {
  private readonly itemById = new Map<string, EpubManifestItem>();
  private readonly itemByHref = new Map<string, EpubManifestItem>();

  private readonly readingOrder: string[];
  public readonly title: string;

  constructor({ manifestItems, readingOrder, title }: EpubContentOptions) {
    this.readingOrder = readingOrder;
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
          resolveTasks.push(this.setImageSrc(image, imageItem));
        }
      }
    }

    const cssLinks = pageDocument.querySelectorAll("link[rel=stylesheet]");
    for (const link of cssLinks) {
      const path = link.getAttribute("href");
      if (path != null) {
        const cssItem = this.resolveItemByRelativePath(item.href, path);
        if (cssItem) {
          resolveTasks.push(this.setLinkHref(link as HTMLLinkElement, cssItem));
        }
      }
    }

    const links = pageDocument.querySelectorAll("a");
    for (const link of links) {
      link.setAttribute("target", "_parent");
      const path = link.getAttribute("href");
      if (path != null) {
        const linkTo = this.resolveItemByRelativePath(item.href, path);
        if (linkTo) {
          link.setAttribute("href", `#book/${linkTo.href}`);
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

  private async getObjectUrl(item: EpubManifestItem) {
    const blob = await item.zipEntry.async("blob");
    const typedBlob = new Blob([blob], { type: item.mediaType });
    return URL.createObjectURL(typedBlob);
  }

  private resolveItemByRelativePath(basePath: string, relativePath: string) {
    let endPath = relativePath.split("#", 2)[0];
    const resolvedPath = resolvePath(dirName(basePath), endPath);
    return this.itemByHref.get(resolvedPath);
  }

  private async setImageSrc(image: HTMLImageElement, item: EpubManifestItem) {
    image.src = await this.getObjectUrl(item);
  }

  private async setLinkHref(link: HTMLLinkElement, item: EpubManifestItem) {
    link.href = await this.getObjectUrl(item);
  }

  dispose() { }
}