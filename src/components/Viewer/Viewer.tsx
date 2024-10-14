import JSZip from "jszip";
import { useEffect, useMemo, useState } from "react";
import { CbzViewer } from "../CbzViewer/CbzViewer";
import { EpubViewer } from "../EpubViewer/EpubViewer";
import type { FileWithHandle } from "browser-fs-access";
import { updateLastFile } from "../FilePicker/updateLastFile";

export function Viewer({
	file,
	onClose,
}: { file: FileWithHandle; onClose: () => void }) {
	const [zip, setZip] = useState<JSZip | null>(null);

	useEffect(() => {
		let cancelled = false;

		const openZip = async () => {
			await Promise.resolve();
			if (cancelled) {
				return;
			}
			setZip(null);
			console.debug("loading zip");
			const zip = await new JSZip().loadAsync(file);
			console.debug("loaded zip");
			if (cancelled) {
				return;
			}
			setZip(zip);
			if (file.handle) {
				updateLastFile(file.handle);
			}
		};

		openZip();

		return () => {
			cancelled = true;
		};
	}, [file]);

	const lastPageIndexKey = useMemo(
		() => ["lastPageIndex", file.name, file.size],
		[file],
	);
	const documentName = file.name.replace(/\.(\w+)$/i, "");

	if (!zip) {
		return <div>Loading...</div>;
	}

	const isEpub = file.name.toLowerCase().endsWith(".epub");

	if (isEpub) {
		return (
			<EpubViewer
				lastPageIndexKey={lastPageIndexKey}
				zip={zip}
				onClose={onClose}
			/>
		);
	}

	return (
		<CbzViewer
			lastPageIndexKey={lastPageIndexKey}
			zip={zip}
			documentName={documentName}
			onClose={onClose}
		/>
	);
}
