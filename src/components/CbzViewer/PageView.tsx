import type { PageInfo, PageLoader } from "@/helpers/PageLoader";
import { useFullScreen } from "@/hooks/useFullScreen";
import { useEffect, useRef, useState } from "react";
import { Hud } from "../Hud/Hud";
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

	const toggleFullScreen = useFullScreen();

	return (
		<div
			ref={containerRef}
			className="h-screen grid place-items-center overflow-auto"
			onWheel={(e) => {
				if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
					return;
				}
				onChangePage(e.deltaY > 0 ? 1 : -1);
			}}
		>
			<Hud>
				<HudCloseButton onClick={onClose} />
				<HudPageButtons onChangePage={onChangePage} />
			</Hud>
			{pageInfo ? (
				<img
					ref={imageRef}
					className="w-auto min-h-0 h-full object-contain"
					src={pageInfo.imageUrl}
					alt={pageInfo.name}
					onDoubleClick={toggleFullScreen}
				/>
			) : (
				<div>Loading page {pageIndex}...</div>
			)}
		</div>
	);
}
