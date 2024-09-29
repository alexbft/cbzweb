import { EpubContent } from "@/helpers/EpubContent";
import { EpubPage } from "@/helpers/EpubPage";
import { setTitle } from "@/helpers/setTitle";
import { get, set } from "idb-keyval";
import { useCallback, useEffect, useRef } from "react";

import bookCss from "./book.css?inline";
import bookHtml from "./bookIndex.html?raw";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ColorScheme } from "@/types/ColorScheme";
import { useAppConfig } from "@/hooks/useAppConfig";
import { useCurrentBookConfig } from "@/hooks/useCurrentBookConfig";

export interface EpubViewController {
  jumpTo(href: string): void;
}

function waitUntilLoaded(iframe: HTMLIFrameElement) {
  return new Promise<void>((resolve) => {
    iframe.addEventListener("load", () => {
      resolve();
    }, { once: true });
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

export function EpubContentView({ content, lastPageIndexKey, onScroll, controllerRef, onToggleFullscreen }: {
  content: EpubContent;
  lastPageIndexKey: IDBValidKey;
  onScroll: (verticalDirection: number) => void;
  controllerRef: React.MutableRefObject<EpubViewController | null>;
  onToggleFullscreen: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updateIframeColorScheme = useCallback((colorScheme: ColorScheme) => {
    const iframe = iframeRef.current;
    if (iframe) {
      const documentElement = iframe.contentDocument!.documentElement;
      documentElement.classList.remove("light", "dark");
      documentElement.classList.add(colorScheme);
      const pages = iframe.contentDocument!.querySelectorAll(".page");
      for (const page of pages) {
        const pageElement = page.shadowRoot!.querySelector("html")!;
        pageElement.classList.remove("light", "dark");
        pageElement.classList.add(colorScheme);
      }
    }
  }, []);

  const updateCssVar = useCallback((name: string, value: string) => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.contentDocument!.documentElement.style.setProperty(name, value);
    }
  }, []);

  const { computedColorScheme } = useColorScheme();

  useEffect(() => {
    updateIframeColorScheme(computedColorScheme);
  }, [computedColorScheme]);

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

  const createScrollEndHandler = useCallback(() => {
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

  const { fontSize, globalUserCss } = useAppConfig();

  useEffect(() => {
    updateCssVar("--book-font-size", `${fontSize}px`);
  }, [fontSize]);

  const globalUserCssSheetRef = useRef<CSSStyleSheet | null>(null);

  useEffect(() => {
    globalUserCssSheetRef.current?.replace(wrapGlobalUserCss(globalUserCss));
  }, [globalUserCss]);

  const currentBookConfig = useCurrentBookConfig();

  const currentBookUserCssSheetRef = useRef<CSSStyleSheet | null>(null);

  useEffect(() => {
    if (currentBookConfig != null) {
      currentBookUserCssSheetRef.current?.replace(wrapCurrentBookUserCss(currentBookConfig.userCss));
    }
  }, [currentBookConfig?.userCss]);

  useEffect(() => {
    let isCancelled = false;

    async function* pagesGenerator() {
      for (let pageIndex = 0; pageIndex < content.numPages; pageIndex++) {
        yield await content.getPage(pageIndex);
      }
    }

    function addPage(page: EpubPage, stylesheets: CSSStyleSheet[], isFirstPage = false) {
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
        e.preventDefault();
        if (e.target instanceof HTMLImageElement) {
          window.open(e.target.src, "_blank");
        } else {
          onToggleFullscreen();
        }
      });
      shadowRoot.adoptedStyleSheets = stylesheets;
      shadowRoot.appendChild(page.documentElement);
      const pageElement = shadowRoot.querySelector("html")!;
      pageElement.classList.add(computedColorScheme);
      contentDocument.body.appendChild(pageContainer);
      const observer = new IntersectionObserver(handleIntersection(page.title));
      observer.observe(pageContainer);
    }

    const handleScrollEnd = createScrollEndHandler();
    const scrollEndHandler = () => {
      handleScrollEnd(iframeRef.current!.contentDocument!.documentElement.scrollTop * window.devicePixelRatio);
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

    let prevScrollTop: number | null = null;
    function scrollHandler() {
      const scrollTop = iframeRef.current?.contentDocument?.documentElement.scrollTop;
      if (scrollTop != null) {
        if (prevScrollTop !== null) {
          onScroll(Math.sign(scrollTop - prevScrollTop));
        }
        prevScrollTop = scrollTop;
      }
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
        iframe.sandbox.add("allow-scripts");
        iframe.srcdoc = bookHtml;
        await waitUntilLoaded(iframe);
        const createStylesheet = (iframe.contentWindow! as any).createStylesheet as () => CSSStyleSheet;
        const bookStylesheet = createStylesheet();
        const globalUserCssSheet = createStylesheet();
        const currentBookUserCssSheet = createStylesheet();
        iframe.sandbox.remove("allow-scripts");
        updateIframeColorScheme(computedColorScheme);
        updateCssVar("--book-font-size", `${fontSize}px`);
        bookStylesheet.replaceSync(bookCss);
        globalUserCssSheet.replaceSync(wrapGlobalUserCss(globalUserCss));
        globalUserCssSheetRef.current = globalUserCssSheet;
        currentBookUserCssSheet.replaceSync(wrapCurrentBookUserCss(currentBookConfig?.userCss ?? ""));
        currentBookUserCssSheetRef.current = currentBookUserCssSheet;
        iframe.contentDocument!.addEventListener("scrollend", scrollEndHandler);
        iframe.contentDocument!.addEventListener("scroll", scrollHandler);

        let isFirstPage = true;
        for await (const page of pagesGenerator()) {
          if (isCancelled) {
            return;
          }
          addPage(page, [bookStylesheet, globalUserCssSheet, currentBookUserCssSheet], isFirstPage);
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
      iframeRef.current?.contentDocument?.removeEventListener("scrollend", scrollEndHandler);
      iframeRef.current?.contentDocument?.removeEventListener("scroll", scrollHandler);
      globalUserCssSheetRef.current = null;
      currentBookUserCssSheetRef.current = null;
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

  useEffect(() => {
    controllerRef.current = {
      jumpTo(href) {
        scrollToHref(href);
      }
    };

    return () => {
      controllerRef.current = null;
    }
  }, [controllerRef]);

  return (
    <>
      <iframe
        ref={iframeRef}
        className="w-full h-full"
        sandbox="allow-same-origin allow-top-navigation-by-user-activation"
        src="about:blank"
      />
    </>
  );
}

function wrapGlobalUserCss(css: string) {
  return `@layer user-global {\n${css}\n}`;
}

function wrapCurrentBookUserCss(css: string) {
  return `@layer user-local {\n${css}\n}`;
}