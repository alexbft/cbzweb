import type { PageLoader } from "@/helpers/PageLoader";
import { useFullScreen } from "@/hooks/useFullScreen";
import { MaximizeIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	type ReactZoomPanPinchRef,
	TransformComponent,
	TransformWrapper,
} from "react-zoom-pan-pinch";
import { Hud } from "../Hud/Hud";
import { HudButton } from "../Hud/HudButton";
import { HudCloseButton } from "../HudCloseButton/HudCloseButton";
import { HudPageButtons } from "../HudPageButtons/HudPageButtons";

export function PageView({
	pageLoader,
	pageIndex,
	onChangePage,
	onClose,
}: {
	pageLoader: PageLoader;
	pageIndex: number;
	onChangePage: (delta: number) => void;
	onClose: () => void;
}) {
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [pageName, setPageName] = useState<string | null>(null);

	const transformWrapperRef = useRef<ReactZoomPanPinchRef>(null);

	useEffect(() => {
		let cancelled = false;

		async function loadPage() {
			const displayLoadingIndicatorTimeout = setTimeout(() => {
				if (cancelled) {
					return;
				}
				setImageUrl(null);
				setPageName(null);
			}, 100);
			const pageInfo = await pageLoader.getPage(pageIndex);
			clearTimeout(displayLoadingIndicatorTimeout);
			if (cancelled) {
				return;
			}
			const image = new Image();
			image.src = pageInfo.imageUrl;
			image.onload = () => {
				if (cancelled) {
					return;
				}
				setImageUrl(pageInfo.imageUrl);
				setPageName(pageInfo.name);
			};
		}

		loadPage();

		return () => {
			cancelled = true;
		};
	}, [pageLoader, pageIndex]);

	useEffect(() => {
		if (imageUrl === null) {
			return;
		}

		const transformWrapper = transformWrapperRef.current;
		if (transformWrapper === null) {
			return;
		}

		const state = transformWrapper.instance.transformState;
		const maxPositionX = transformWrapper.instance.bounds?.maxPositionX ?? 0;
		transformWrapper.setTransform(maxPositionX, 0, state.scale, 100);
	}, [imageUrl]);

	const scrollDownOrNextPage = useCallback(() => {
		const transformWrapper = transformWrapperRef.current;
		if (transformWrapper === null) {
			return;
		}
		const state = transformWrapper.instance.transformState;
		const minPositionY = transformWrapper.instance.bounds?.minPositionY ?? 0;
		if (state.positionY > minPositionY) {
			transformWrapper.setTransform(
				state.positionX,
				Math.max(state.positionY - 1000, minPositionY),
				state.scale,
			);
		} else {
			onChangePage(1);
		}
	}, [onChangePage]);

	const imageRef = useRef<HTMLImageElement>(null);
	const allowScrollRef = useRef(true);

	const toggleFullScreen = useFullScreen();

	const handleWheel = useCallback(
		(e: WheelEvent) => {
			if (!allowScrollRef.current) {
				return;
			}
			if (e.shiftKey || e.ctrlKey || e.metaKey) {
				return;
			}
			// biome-ignore lint/suspicious/noExplicitAny: this non-standard property is used to detect mouse/trackpad
			const wheelDeltaY = (e as any).wheelDeltaY as number | undefined;
			const isTrackpad = detectTrackpad(e.deltaY, wheelDeltaY);
			if (!e.altKey && isTrackpad) {
				return;
			}
			const currentScale =
				transformWrapperRef.current?.instance.transformState.scale ?? 1;
			if (!e.altKey && currentScale !== 1) {
				return;
			}
			const direction = e.deltaY > 0 ? 1 : -1;
			e.stopPropagation();
			onChangePage(direction);
			if (e.altKey) {
				allowScrollRef.current = false;
				setTimeout(() => {
					allowScrollRef.current = true;
				}, 50);
			}
		},
		[onChangePage],
	);

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			switch (e.key) {
				case "PageUp":
				case "W":
				case "w":
				case "A":
				case "a":
					e.preventDefault();
					onChangePage(-1);
					break;
				case "PageDown":
				case "S":
				case "s":
				case "D":
				case "d":
					e.preventDefault();
					onChangePage(1);
					break;
				case " ":
					e.preventDefault();
					scrollDownOrNextPage();
					break;
				case "Escape":
					e.preventDefault();
					onClose();
					break;
			}
		}

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [onChangePage, onClose, scrollDownOrNextPage]);

	return (
		<div
			className="h-screen"
			onWheelCapture={(e) => handleWheel(e.nativeEvent)}
		>
			<Hud>
				<HudCloseButton onClick={onClose} />
				<HudButton onClick={toggleFullScreen} className="absolute top-4 left-6">
					<MaximizeIcon className="size-7" />
				</HudButton>
				<HudPageButtons onChangePage={onChangePage} />
			</Hud>
			{imageUrl ? (
				<TransformWrapper
					ref={transformWrapperRef}
					wheel={{ smoothStep: 0.02, wheelDisabled: true }}
					panning={{ wheelPanning: true }}
					disablePadding={true}
					centerOnInit={true}
					doubleClick={{ mode: "toggle" }}
				>
					<TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
						<img
							ref={imageRef}
							src={imageUrl}
							alt={pageName ?? ""}
							className="object-contain portrait:h-auto portrait:w-screen landscape:h-screen landscape:w-auto"
						/>
					</TransformComponent>
				</TransformWrapper>
			) : (
				<div
					className="size-full p-8 text-center"
					onWheel={(e) => handleWheel(e.nativeEvent)}
				>
					Loading page {pageIndex}...
				</div>
			)}
		</div>
	);
}

function detectTrackpad(deltaY: number, wheelDeltaY: number | undefined) {
	if (wheelDeltaY === undefined) {
		return false;
	}
	if (deltaY === 0) {
		return true;
	}
	const diff = -3 * deltaY - wheelDeltaY;
	return Math.abs(diff / deltaY) < 0.1;
}
