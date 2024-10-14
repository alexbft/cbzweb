import { get } from "idb-keyval";

export async function getHistory() {
	const result = await get<FileSystemFileHandle[]>("history");
	return result ?? [];
}
