import type { PageInfo, PageLoader } from "@/helpers/PageLoader";
import { useFullScreen } from "@/hooks/useFullScreen";
import { useCallback, useEffect, useRef, useState } from "react";
import { Hud } from "../Hud/Hud";
import { HudCloseButton } from "../HudCloseButton/HudCloseButton";
import { HudPageButtons } from "../HudPageButtons/HudPageButtons";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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
	const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);

	useEffect(() => {
		let cancelled = false;
		let success = false;
		setTimeout(() => {
			if (!success) {
				setPageInfo(null);
			}
		}, 0);
		pageLoader.getPage(pageIndex).then((pageInfo) => {
			if (!cancelled) {
				success = true;
				setPageInfo(pageInfo);
				setTimeout(() => {
					containerRef.current?.scrollTo(0, 0);
				}, 0);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [pageLoader, pageIndex]);

	const containerRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);
	const allowScrollRef = useRef(true);

	const toggleFullScreen = useFullScreen();

	const handleWheel = useCallback(
		(e: WheelEvent) => {
			if (!allowScrollRef.current) {
				return;
			}
			if (e.altKey || e.ctrlKey || e.metaKey) {
				return;
			}
			if (
				!e.shiftKey &&
				e.deltaMode === WheelEvent.DOM_DELTA_PIXEL &&
				Math.abs(e.deltaY) < 100
			) {
				return;
			}
			onChangePage(e.deltaY > 0 ? 1 : -1);
			if (e.shiftKey) {
				allowScrollRef.current = false;
				setTimeout(() => {
					allowScrollRef.current = true;
				}, 50);
			}
		},
		[onChangePage],
	);

	return (
		<div
			ref={containerRef}
			className="h-screen"
			onWheelCapture={(e) => handleWheel(e.nativeEvent)}
		>
			<Hud>
				<HudCloseButton onClick={onClose} />
				<HudPageButtons onChangePage={onChangePage} />
			</Hud>
			{pageInfo ? (
				<TransformWrapper
					wheel={{ smoothStep: 0.02, wheelDisabled: true }}
					panning={{ wheelPanning: true }}
					disablePadding={true}
				>
					<TransformComponent wrapperClass="size-full" contentClass="size-full">
						<img
							ref={imageRef}
							src={pageInfo.imageUrl}
							alt={pageInfo.name}
							className="size-full object-contain"
							onDoubleClick={toggleFullScreen}
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
