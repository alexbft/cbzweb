import { useState } from "react";
import { FilePicker } from "../FilePicker/FilePicker";
import { Viewer } from "../Viewer/Viewer";
import { setDefaultTitle } from "../../helpers/setTitle";
import type { FileWithHandle } from "browser-fs-access";

export function Main() {
	const [autoLoadRecent, setAutoLoadRecent] = useState(true);
	const [file, setFile] = useState<FileWithHandle | null>(null);

	const handleClose = () => {
		setAutoLoadRecent(false);
		setFile(null);
		setDefaultTitle();
	};

	return (
		<main className="h-screen touch-manipulation bg-bg-light text-fg-light dark:bg-bg-dark dark:text-gray-50">
			{file ? (
				<Viewer file={file} onClose={handleClose} />
			) : (
				<FilePicker autoLoadRecent={autoLoadRecent} onFileChange={setFile} />
			)}
		</main>
	);
}
