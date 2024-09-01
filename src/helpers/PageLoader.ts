import JSZip from "jszip";

function revokeObjectURL(pageIndex: number) {
  console.debug("revoking object URL", pageIndex);
  return (info: PageInfo) => {
    URL.revokeObjectURL(info.imageUrl);
  };
}

export type PageInfo = {
  name: string;
  imageUrl: string;
};

const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".tiff", ".tif"];

function comparePaths(pathA: string, pathB: string) {
  const partsA = pathA.split("/");
  const partsB = pathB.split("/");
  for (let i = 0; i < Math.min(partsA.length, partsB.length); i++) {
    const partA = partsA[i];
    const partB = partsB[i];
    if (partA < partB) {
      return -1;
    }
    if (partA > partB) {
      return 1;
    }
  }
  return partsA.length - partsB.length;
}

export class PageLoader {
  private readonly pages: JSZip.JSZipObject[];
  private lastPageIndex = -1;
  private prevPagePromise: Promise<PageInfo> | null = null;
  private lastPagePromise: Promise<PageInfo> | null = null;
  private nextPagePromise: Promise<PageInfo> | null = null;

  constructor(zip: JSZip) {
    this.pages = Object.values(zip.files).filter(obj => !obj.dir && allowedExtensions.some(ext => obj.name.endsWith(ext)));
    this.pages.sort((a, b) => comparePaths(a.name, b.name));
  }

  getPage(index: number): Promise<PageInfo> {
    if (index === this.lastPageIndex && this.lastPagePromise) {
      return this.lastPagePromise;
    }
    if (index === this.lastPageIndex + 1 && this.nextPagePromise) {
      this.prevPagePromise?.then(revokeObjectURL(this.lastPageIndex - 1));
      this.prevPagePromise = this.lastPagePromise;
      this.lastPagePromise = this.nextPagePromise;
      this.nextPagePromise = this.getPageInternal(index + 1);
    } else if (index === this.lastPageIndex - 1 && this.prevPagePromise) {
      this.nextPagePromise?.then(revokeObjectURL(this.lastPageIndex + 1));
      this.nextPagePromise = this.lastPagePromise;
      this.lastPagePromise = this.prevPagePromise;
      this.prevPagePromise = this.getPageInternal(index - 1);
    } else {
      this.prevPagePromise?.then(revokeObjectURL(this.lastPageIndex - 1));
      this.lastPagePromise?.then(revokeObjectURL(this.lastPageIndex));
      this.nextPagePromise?.then(revokeObjectURL(this.lastPageIndex + 1));
      this.prevPagePromise = this.getPageInternal(index - 1);
      this.lastPagePromise = this.getPageInternal(index);
      this.nextPagePromise = this.getPageInternal(index + 1);
    }
    this.lastPageIndex = index;
    if (this.lastPagePromise === null) {
      throw new Error("Page not found");
    }
    return this.lastPagePromise;
  }

  get numPages(): number {
    return this.pages.length;
  }

  private getPageInternal(index: number): Promise<PageInfo> | null {
    if (index < 0 || index >= this.pages.length) {
      return null;
    }
    console.debug("loading page", index);
    return (async () => {
      const page = this.pages[index];
      if (!page) {
        throw new Error("Page not found");
      }
      const blob = await page.async("blob");
      const url = URL.createObjectURL(blob);
      console.debug("loaded page", index);
      return { name: page.name, imageUrl: url };
    })();
  }
}