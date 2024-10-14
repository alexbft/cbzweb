import { fileOpen, type FileWithHandle, supported } from "browser-fs-access";
import { get } from "idb-keyval";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { getHistory } from "./getHistory";

export function FilePicker({
	autoLoadRecent,
	onFileChange,
}: {
	autoLoadRecent: boolean;
	onFileChange: (file: FileWithHandle) => void;
}) {
	const [history, setHistory] = useState<FileSystemFileHandle[]>([]);

	useEffect(() => {
		const loadLastFileHandle = async () => {
			const lastFileHandle = await get<FileSystemFileHandle>("lastFile");
			if (lastFileHandle) {
				const havePermission = await lastFileHandle.queryPermission({
					mode: "read",
				});
				if (havePermission === "granted") {
					const file = await lastFileHandle.getFile();
					onFileChange(file);
					return;
				}
			}
		};

		const loadHistory = async () => {
			setHistory(await getHistory());
		};

		if (autoLoadRecent) {
			loadLastFileHandle();
		} else {
			loadHistory();
		}
	}, [autoLoadRecent, onFileChange]);

	const handleOpenFile = useCallback(async () => {
		try {
			const file = await fileOpen({
				extensions: [".cbz", ".epub"],
			});
			onFileChange(file);
		} catch (e) {
			if (!(e instanceof DOMException && e.name === "AbortError")) {
				throw e;
			}
		}
	}, [onFileChange]);

	const openHistoryEntry = useCallback(
		async (fileHandle: FileSystemFileHandle) => {
			if (!supported) {
				throw new Error("File system access not supported");
			}
			const havePermission = await fileHandle.queryPermission({
				mode: "read",
			});
			if (havePermission !== "granted") {
				const newPermission = await fileHandle.requestPermission({
					mode: "read",
				});
				if (newPermission !== "granted") {
					return;
				}
			}
			const file = await fileHandle.getFile();
			const fileWithHandle = file as FileWithHandle;
			fileWithHandle.handle = fileHandle;
			onFileChange(fileWithHandle);
		},
		[onFileChange],
	);

	const recentHistory = useMemo(() => history.slice(0, 5), [history]);

	return (
		<main className="mx-auto flex max-w-3xl flex-col gap-4 pt-8">
			<div>
				<Button onClick={handleOpenFile}>Open file...</Button>
			</div>
			<ul>
				{recentHistory.map((fileHandle) => (
					<li key={fileHandle.name}>
						<Button
							variant="link"
							className="p-0"
							onClick={() => openHistoryEntry(fileHandle)}
						>
							{fileHandle.name}
						</Button>
					</li>
				))}
			</ul>
		</main>
	);
}
