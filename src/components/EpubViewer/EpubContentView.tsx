import type { EpubContent } from "@/helpers/EpubContent";
import type { EpubPage } from "@/helpers/EpubPage";
import { setTitle } from "@/helpers/setTitle";
import { get, set } from "idb-keyval";
import { useCallback, useEffect, useRef } from "react";
import { useAppConfig } from "@/hooks/useAppConfig";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useCurrentBookConfig } from "@/hooks/useCurrentBookConfig";
import type { ColorScheme } from "@/types/ColorScheme";
import bookCss from "./assets/book.css?inline";
import bookHtml from "./assets/bookIndex.html?raw";

export interface EpubViewController {
	jumpTo(href: string): void;
}

function waitUntilLoaded(iframe: HTMLIFrameElement) {
	return new Promise<void>((resolve) => {
		iframe.addEventListener(
			"load",
			() => {
				resolve();
			},
			{ once: true },
		);
	});
}

function findAnchor(target: unknown): HTMLAnchorElement | null {
	if (target == null || typeof target !== "object") {
		return null;
	}
	if ("tagName" in target && target.tagName === "A") {
		return target as HTMLAnchorElement;
	}
	if ("parentElement" in target) {
		return findAnchor(target.parentElement);
	}
	return null;
}

export function EpubContentView({
	content,
	lastPageIndexKey,
	onScroll,
	controllerRef,
	onToggleFullscreen,
}: {
	content: EpubContent;
	lastPageIndexKey: IDBValidKey;
	onScroll: (verticalDirection: number) => void;
	controllerRef: React.MutableRefObject<EpubViewController | null>;
	onToggleFullscreen: () => void;
}) {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const getContentDocument = useCallback(
		() => iframeRef.current?.contentDocument,
		[],
	);

	const updateIframeColorScheme = useCallback(
		(colorScheme: ColorScheme) => {
			const contentDocument = getContentDocument();
			if (contentDocument) {
				const documentElement = contentDocument.documentElement;
				documentElement.classList.remove("light", "dark");
				documentElement.classList.add(colorScheme);
				const pages = contentDocument.querySelectorAll(".page");
				for (const page of pages) {
					const pageElement = page.shadowRoot?.querySelector("html");
					if (pageElement) {
						pageElement.classList.remove("light", "dark");
						pageElement.classList.add(colorScheme);
					}
				}
			}
		},
		[getContentDocument],
	);

	const updateCssVar = useCallback(
		(name: string, value: string) => {
			const contentDocument = getContentDocument();
			if (contentDocument) {
				contentDocument.documentElement.style.setProperty(name, value);
			}
		},
		[getContentDocument],
	);

	const { computedColorScheme } = useColorScheme();

	useEffect(() => {
		updateIframeColorScheme(computedColorScheme);
	}, [updateIframeColorScheme, computedColorScheme]);

	const scrollToHref = useCallback(
		(href: string, pushState = true) => {
			const contentDocument = getContentDocument();
			if (!contentDocument) {
				return;
			}

			const currentScrollTop = contentDocument.documentElement.scrollTop;
			const maybePushState = () => {
				if (pushState) {
					history.replaceState({ scrollTop: currentScrollTop }, "");
					history.pushState({ href }, "");
				}
			};

			const [pageId, elementId] = href.split("#", 2);
			const pageContainer = contentDocument.getElementById(`book/${pageId}`);
			if (pageContainer) {
				if (!elementId) {
					pageContainer.scrollIntoView();
					maybePushState();
				} else {
					const element = pageContainer.shadowRoot?.getElementById(elementId);
					if (element) {
						element.scrollIntoView();
						maybePushState();
					}
				}
			}
		},
		[getContentDocument],
	);

	const handleIntersection = useCallback(
		(pageTitle: string) => (entries: IntersectionObserverEntry[]) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					setTitle(`${content.title} — ${pageTitle}`);
				}
			}
		},
		[content.title],
	);

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
			idleCallback = window.requestIdleCallback(
				() => {
					idleCallback = null;
					set(lastPageIndexKey, scrollTop);
				},
				{ timeout: 1000 },
			);
		};
	}, [lastPageIndexKey]);

	const { fontSize, globalUserCss } = useAppConfig();

	useEffect(() => {
		updateCssVar("--book-font-size", `${fontSize}px`);
	}, [updateCssVar, fontSize]);

	const globalUserCssSheetRef = useRef<CSSStyleSheet | null>(null);

	useEffect(() => {
		globalUserCssSheetRef.current?.replace(wrapGlobalUserCss(globalUserCss));
	}, [globalUserCss]);

	const currentBookConfig = useCurrentBookConfig();

	const currentBookUserCssSheetRef = useRef<CSSStyleSheet | null>(null);

	useEffect(() => {
		if (currentBookConfig != null) {
			currentBookUserCssSheetRef.current?.replace(
				wrapCurrentBookUserCss(currentBookConfig.userCss),
			);
		}
	}, [currentBookConfig]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: should happen only on load
	useEffect(() => {
		let isCancelled = false;

		async function* pagesGenerator() {
			for (let pageIndex = 0; pageIndex < content.numPages; pageIndex++) {
				yield await content.getPage(pageIndex);
			}
		}

		function addPage(
			page: EpubPage,
			stylesheets: CSSStyleSheet[],
			isFirstPage = false,
		) {
			const contentDocument = getContentDocument();
			if (!contentDocument) {
				return;
			}
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
			const pageElement = shadowRoot.querySelector("html");
			pageElement?.classList.add(computedColorScheme);
			contentDocument.body.appendChild(pageContainer);
			const observer = new IntersectionObserver(handleIntersection(page.title));
			observer.observe(pageContainer);
		}

		const handleScrollEnd = createScrollEndHandler();
		const scrollEndHandler = () => {
			const contentDocument = getContentDocument();
			if (!contentDocument) {
				return;
			}
			handleScrollEnd(
				contentDocument.documentElement.scrollTop * window.devicePixelRatio,
			);
		};

		function restoreScroll(scrollTop: number) {
			const contentDocument = getContentDocument();
			if (!contentDocument) {
				return false;
			}
			const maxScrollTop =
				contentDocument.documentElement.scrollHeight -
				contentDocument.documentElement.clientHeight;
			if (scrollTop <= maxScrollTop) {
				contentDocument.documentElement.scrollTop = scrollTop;
				return true;
			}
			return false;
		}

		let prevScrollTop: number | null = null;
		function scrollHandler() {
			const scrollTop =
				iframeRef.current?.contentDocument?.documentElement.scrollTop;
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
				const prevScrollTopPromise = get<number>(lastPageIndexKey).then(
					(value) => {
						if (value != null) {
							prevScrollTop = value / window.devicePixelRatio;
						}
					},
				);
				// biome-ignore lint/style/noNonNullAssertion: iframe should be defined
				const iframe = iframeRef.current!;
				iframe.sandbox.add("allow-scripts");
				iframe.srcdoc = bookHtml;
				await waitUntilLoaded(iframe);
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const createStylesheet = (iframe.contentWindow! as any)
					.createStylesheet as () => CSSStyleSheet;
				const bookStylesheet = createStylesheet();
				const globalUserCssSheet = createStylesheet();
				const currentBookUserCssSheet = createStylesheet();
				iframe.sandbox.remove("allow-scripts");
				updateIframeColorScheme(computedColorScheme);
				updateCssVar("--book-font-size", `${fontSize}px`);
				bookStylesheet.replaceSync(bookCss);
				globalUserCssSheet.replaceSync(wrapGlobalUserCss(globalUserCss));
				globalUserCssSheetRef.current = globalUserCssSheet;
				currentBookUserCssSheet.replaceSync(
					wrapCurrentBookUserCss(currentBookConfig?.userCss ?? ""),
				);
				currentBookUserCssSheetRef.current = currentBookUserCssSheet;
				const contentDocument = getContentDocument();
				contentDocument?.addEventListener("scrollend", scrollEndHandler);
				contentDocument?.addEventListener("scroll", scrollHandler);

				let isFirstPage = true;
				for await (const page of pagesGenerator()) {
					if (isCancelled) {
						return;
					}
					addPage(
						page,
						[bookStylesheet, globalUserCssSheet, currentBookUserCssSheet],
						isFirstPage,
					);
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
			iframeRef.current?.contentDocument?.removeEventListener(
				"scrollend",
				scrollEndHandler,
			);
			iframeRef.current?.contentDocument?.removeEventListener(
				"scroll",
				scrollHandler,
			);
			globalUserCssSheetRef.current = null;
			currentBookUserCssSheetRef.current = null;
		};
	}, [content]);

	useEffect(() => {
		function handlePopState(e: PopStateEvent) {
			if (e.state?.href) {
				scrollToHref(e.state.href, false);
			}
			if (e.state?.scrollTop != null) {
				const contentDocument = getContentDocument();
				if (contentDocument) {
					contentDocument.documentElement.scrollTop = e.state.scrollTop;
				}
			}
		}

		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, [getContentDocument, scrollToHref]);

	useEffect(() => {
		controllerRef.current = {
			jumpTo(href) {
				scrollToHref(href);
			},
		};

		return () => {
			controllerRef.current = null;
		};
	}, [controllerRef, scrollToHref]);

	return (
		<>
			<iframe
				title="Epub Content"
				ref={iframeRef}
				className="size-full"
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
