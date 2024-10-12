import { setTitle } from "@/helpers/setTitle";
import { get, set } from "idb-keyval";
import type JSZip from "jszip";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageLoader } from "../../helpers/PageLoader";
import { PageView } from "./PageView";

export function CbzViewer({
	zip,
	lastPageIndexKey,
	documentName,
	onClose,
}: {
	zip: JSZip;
	lastPageIndexKey: IDBValidKey;
	documentName: string;
	onClose: () => void;
}) {
	const pageLoader = useMemo(() => {
		return new PageLoader(zip);
	}, [zip]);

	const [pageIndex, setPageIndex] = useState<number | null>(null);

	useEffect(() => {
		(async () => {
			const lastPageIndex = await get<number>(lastPageIndexKey);
			setPageIndex(lastPageIndex ?? 0);
		})();
	}, [lastPageIndexKey]);

	useEffect(() => {
		if (pageIndex !== null) {
			set(lastPageIndexKey, pageIndex);
			setTitle(`[${pageIndex + 1}/${pageLoader.numPages}] ${documentName}`);
		}
	}, [pageIndex, lastPageIndexKey, documentName, pageLoader.numPages]);

	const handlePageChange = useCallback(
		(delta: number) => {
			if (pageIndex === null) {
				return;
			}
			const newPageIndex = pageIndex + delta;
			if (newPageIndex < 0 || newPageIndex >= pageLoader.numPages) {
				return;
			}
			setPageIndex(newPageIndex);
		},
		[pageIndex, pageLoader],
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
					handlePageChange(-1);
					break;
				case "PageDown":
				case " ":
				case "S":
				case "s":
				case "D":
				case "d":
					e.preventDefault();
					handlePageChange(1);
					break;
				case "Escape":
					e.preventDefault();
					onClose();
					break;
				default:
					console.log(e.key);
			}
		}

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [handlePageChange, onClose]);

	return pageIndex !== null ? (
		<PageView
			pageLoader={pageLoader}
			pageIndex={pageIndex}
			onChangePage={handlePageChange}
			onClose={onClose}
		/>
	) : (
		<div>Loading...</div>
	);
}
