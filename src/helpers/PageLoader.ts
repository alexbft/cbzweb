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

export class PageLoader {
  private readonly pages: JSZip.JSZipObject[];
  private lastPageIndex = -1;
  private lastPagePromise: Promise<PageInfo> | null = null;
  private nextPagePromise: Promise<PageInfo> | null = null;

  constructor(zip: JSZip) {
    this.pages = Object.values(zip.files).filter(obj => !obj.dir);
  }

  getPage(index: number): Promise<PageInfo> {
    if (index === this.lastPageIndex && this.lastPagePromise) {
      return this.lastPagePromise;
    }
    if (index === this.lastPageIndex + 1 && this.nextPagePromise) {
      this.lastPagePromise?.then(revokeObjectURL(this.lastPageIndex));
      this.lastPagePromise = this.nextPagePromise;
      this.nextPagePromise = this.getPageInternal(index + 1);
    } else {
      this.lastPagePromise?.then(revokeObjectURL(this.lastPageIndex));
      this.nextPagePromise?.then(revokeObjectURL(this.lastPageIndex + 1));
      this.lastPagePromise = this.getPageInternal(index);
      this.nextPagePromise = this.getPageInternal(index + 1);
    }
    this.lastPageIndex = index;
    return this.lastPagePromise;
  }

  get numPages(): number {
    return this.pages.length;
  }

  private async getPageInternal(index: number): Promise<PageInfo> {
    console.debug("loading page", index);
    const page = this.pages[index];
    if (!page) {
      throw new Error("Page not found");
    }
    const blob = await page.async("blob");
    const url = URL.createObjectURL(blob);
    console.debug("loaded page", index);
    return { name: page.name, imageUrl: url };
  }
}