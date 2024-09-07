import { EpubContent } from "@/helpers/EpubContent";
import { EpubPage } from "@/helpers/EpubPage";
import { useCallback, useEffect, useRef } from "react";

import bookHtml from "./bookIndex.html?raw";
import bookCss from "./book.css?inline";
import { setTitle } from "@/helpers/setTitle";
import { get, set } from "idb-keyval";

function waitUntilLoaded(iframe: HTMLIFrameElement) {
  return new Promise<void>((resolve) => {
    iframe.addEventListener("load", () => {
      resolve();
    });
  });
}

export function EpubContentView({ content, lastPageIndexKey }: {
  content: EpubContent;
  lastPageIndexKey: IDBValidKey;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const scrollToPage = useCallback((elementId: string) => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }
    const contentDocument = iframe.contentDocument!;
    const pageContainer = contentDocument.getElementById(elementId);
    if (pageContainer) {
      pageContainer.scrollIntoView();
    }
  }, []);

  const handleIntersection = useCallback((pageTitle: string) => (
    (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setTitle(`${pageTitle} — ${content.title}`);
        }
      }
    }
  ), []);

  const createScrollHandler = useCallback(() => {
    let prevScrollTop = 0;
    let idleCallback: number | null = null;

    return (scrollTop: number) => {
      if (scrollTop === prevScrollTop) {
        return;
      }
      if (idleCallback !== null) {
        window.cancelIdleCallback(idleCallback);
      }
      prevScrollTop = scrollTop;
      idleCallback = window.requestIdleCallback(() => {
        idleCallback = null;
        set(lastPageIndexKey, scrollTop);
      }, { timeout: 10000 });
    };
  }, [lastPageIndexKey]);

  useEffect(() => {
    let isCancelled = false;

    async function* pagesGenerator() {
      for (let pageIndex = 0; pageIndex < content.numPages; pageIndex++) {
        yield await content.getPage(pageIndex);
      }
    }

    function addPage(page: EpubPage) {
      const iframe = iframeRef.current;
      if (!iframe) {
        return;
      }
      const contentDocument = iframe.contentDocument!;
      const pageContainer = contentDocument.createElement("div");
      pageContainer.id = `book/${page.href}`;
      pageContainer.className = "page";
      const shadowRoot = pageContainer.attachShadow({ mode: "open" });
      shadowRoot.addEventListener("click", (e) => {
        if (e.target instanceof HTMLAnchorElement) {
          const url = new URL(e.target.href);
          if (url.origin === window.location.origin) {
            e.preventDefault();
            scrollToPage(url.hash.substring(1));
          }
        }
      });
      const style = contentDocument.createElement("style");
      style.textContent = bookCss;
      shadowRoot.appendChild(style);
      shadowRoot.appendChild(page.documentElement);
      contentDocument.body.appendChild(pageContainer);
      const observer = new IntersectionObserver(handleIntersection(page.title));
      observer.observe(pageContainer);
    }

    const handleScroll = createScrollHandler();
    const scrollHandler = () => {
      handleScroll(iframeRef.current!.contentDocument!.documentElement.scrollTop * window.devicePixelRatio);
    }

    function restoreScroll(scrollTop: number) {
      const iframe = iframeRef.current!;
      const contentDocument = iframe.contentDocument!;
      const maxScrollTop = contentDocument.documentElement.scrollHeight - contentDocument.documentElement.clientHeight;
      if (scrollTop <= maxScrollTop) {
        contentDocument.documentElement.scrollTop = scrollTop;
        return true;
      }
      return false;
    }

    async function load() {
      try {
        let prevScrollTop: number | null = null;
        let scrollRestored = false;
        const prevScrollTopPromise = get<number>(lastPageIndexKey).then((value) => {
          if (value != null) {
            prevScrollTop = value / window.devicePixelRatio;
          }
        });
        const iframe = iframeRef.current!;
        iframe.srcdoc = bookHtml;
        await waitUntilLoaded(iframe);
        iframe.contentDocument!.addEventListener("scrollend", scrollHandler);
        for await (const page of pagesGenerator()) {
          if (isCancelled) {
            return;
          }
          addPage(page);
          if (!scrollRestored && prevScrollTop !== null) {
            scrollRestored = restoreScroll(prevScrollTop);
          }
        }
        if (!scrollRestored) {
          await prevScrollTopPromise;
          if (prevScrollTop !== null) {
            restoreScroll(prevScrollTop);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    load();

    return () => {
      isCancelled = true;
      iframeRef.current?.contentDocument?.removeEventListener("scrollend", scrollHandler);
    }
  }, [content]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full"
      sandbox="allow-same-origin allow-top-navigation-by-user-activation"
      src="about:blank"
    />
  );
}