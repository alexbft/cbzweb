import { EpubContent } from "@/helpers/EpubContent";
import { EpubPage } from "@/helpers/EpubPage";
import { setTitle } from "@/helpers/setTitle";
import { get, set } from "idb-keyval";
import { useCallback, useEffect, useRef } from "react";

import bookCss from "./book.css?inline";
import bookHtml from "./bookIndex.html?raw";
import { TableOfContents } from "./TableOfContents";

function waitUntilLoaded(iframe: HTMLIFrameElement) {
  return new Promise<void>((resolve) => {
    iframe.addEventListener("load", () => {
      resolve();
    });
  });
}

function findAnchor(target: unknown): HTMLAnchorElement | null {
  if (target == null || typeof target !== 'object') {
    return null;
  }
  if ('tagName' in target && target.tagName === 'A') {
    return target as HTMLAnchorElement;
  }
  if ('parentElement' in target) {
    return findAnchor(target.parentElement);
  }
  return null;
}

export function EpubContentView({ content, lastPageIndexKey }: {
  content: EpubContent;
  lastPageIndexKey: IDBValidKey;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const scrollToHref = useCallback((href: string, pushState = true) => {
    const currentScrollTop = iframeRef.current!.contentDocument!.documentElement.scrollTop;
    const maybePushState = () => {
      if (pushState) {
        history.replaceState({ scrollTop: currentScrollTop }, "");
        history.pushState({ href }, "");
      }
    }

    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }
    const contentDocument = iframe.contentDocument!;
    const [pageId, elementId] = href.split("#", 2);
    const pageContainer = contentDocument.getElementById(`book/${pageId}`);
    if (pageContainer) {
      if (!elementId) {
        pageContainer.scrollIntoView();
        maybePushState();
      } else {
        const element = pageContainer.shadowRoot!.getElementById(elementId);
        if (element) {
          element.scrollIntoView();
          maybePushState();
        }
      }
    }
  }, []);

  const handleIntersection = useCallback((pageTitle: string) => (
    (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setTitle(`${content.title} — ${pageTitle}`);
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
      }, { timeout: 1000 });
    };
  }, [lastPageIndexKey]);

  useEffect(() => {
    let isCancelled = false;

    async function* pagesGenerator() {
      for (let pageIndex = 0; pageIndex < content.numPages; pageIndex++) {
        yield await content.getPage(pageIndex);
      }
    }

    function addPage(page: EpubPage, isFirstPage = false) {
      const iframe = iframeRef.current;
      if (!iframe) {
        return;
      }
      const contentDocument = iframe.contentDocument!;
      if (!isFirstPage) {
        const hr = contentDocument.createElement("hr");
        contentDocument.body.appendChild(hr);
      }
      const pageContainer = contentDocument.createElement("div");
      pageContainer.id = `book/${page.href}`;
      pageContainer.className = "page";
      const shadowRoot = pageContainer.attachShadow({ mode: "open" });
      shadowRoot.addEventListener("click", (e) => {
        const anchor = findAnchor(e.target);
        if (anchor) {
          const url = new URL(anchor.href);
          if (url.origin === window.location.origin) {
            e.preventDefault();
            e.stopPropagation();
            scrollToHref(url.hash.substring("#book/".length));
          }
        }
      });
      shadowRoot.addEventListener("dblclick", (e) => {
        if (e.target instanceof HTMLImageElement) {
          e.preventDefault();
          window.open(e.target.src, "_blank");
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

        let isFirstPage = true;
        for await (const page of pagesGenerator()) {
          if (isCancelled) {
            return;
          }
          addPage(page, isFirstPage);
          isFirstPage = false;
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

  useEffect(() => {
    function handlePopState(e: PopStateEvent) {
      if (e.state?.href) {
        scrollToHref(e.state.href, false);
      }
      if (e.state?.scrollTop != null) {
        const iframe = iframeRef.current;
        if (iframe) {
          iframe.contentDocument!.documentElement.scrollTop = e.state.scrollTop;
        }
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <>
      <TableOfContents items={content.toc} onClick={scrollToHref} />

      <iframe
        ref={iframeRef}
        className="w-full h-full"
        sandbox="allow-same-origin allow-top-navigation-by-user-activation"
        src="about:blank"
      />
    </>
  );
}