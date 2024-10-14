import { set } from "idb-keyval";
import { getHistory } from "./getHistory";

export async function updateLastFile(fileHandle: FileSystemFileHandle) {
	await set("lastFile", fileHandle);
	const history = await getHistory();
	// TODO: save an unique id for each file, so it's safer to filter out duplicates
	let newHistory = [
		fileHandle,
		...history.filter((h) => h.name !== fileHandle.name),
	];
	if (newHistory.length > 5) {
		newHistory = newHistory.slice(0, 5);
	}
	await set("history", newHistory);
}
