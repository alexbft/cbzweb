import JSZip from "jszip";

function revokeObjectURL(pageIndex: number) {
  console.debug("revoking object URL", pageIndex);
  return (url: string | null) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  };
}

export class PageLoader {
  private readonly pages: JSZip.JSZipObject[];
  private lastPageIndex = -1;
  private lastPagePromise: Promise<string | null> | null = null;
  private nextPagePromise: Promise<string | null> | null = null;

  constructor(private readonly zip: JSZip) {
    this.pages = Object.values(zip.files).filter(obj => !obj.dir);
  }

  getPage(index: number): Promise<string | null> {
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

  private getPageInternal(index: number): Promise<string | null> {
    console.debug("loading page", index);
    return this.zip.file(this.pages[index]?.name)?.async("blob")?.then((data) => {
      const url = URL.createObjectURL(data);
      console.debug("loaded page", index);
      return url;
    }) ?? Promise.resolve(null);
  }
}