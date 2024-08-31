import { fileOpen, supported } from "browser-fs-access";
import { get, set } from "idb-keyval";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";

export function FilePicker({ onFileChange }: { onFileChange: (file: File) => void }) {
  const [lastFileHandle, setLastFileHandle] = useState<FileSystemFileHandle | null>(null);

  useEffect(() => {
    const loadLastFileHandle = async () => {
      const lastFileHandle = await get<FileSystemFileHandle>('lastFile');
      setLastFileHandle(lastFileHandle ?? null);
    };

    loadLastFileHandle();
  }, []);

  const handleOpenFile = useCallback(async () => {
    try {
      const file = await fileOpen({
        extensions: [".cbz"],
      });
      if (file?.handle) {
        set('lastFile', file.handle);
      }
      onFileChange(file);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        throw e;
      }
    }
  }, []);

  const handleOpenLastFile = useCallback(async () => {
    if (!lastFileHandle) {
      throw new Error("No last file handle");
    }
    if (!supported) {
      throw new Error("File system access not supported");
    }
    const havePermission = await lastFileHandle.queryPermission({ mode: 'read' });
    if (havePermission !== 'granted') {
      const newPermission = await lastFileHandle.requestPermission({ mode: 'read' });
      if (newPermission !== 'granted') {
        return;
      }
    }
    const file = await lastFileHandle.getFile();
    onFileChange(file);
  }, [lastFileHandle]);

  return (
    <>
      <div>
        <Button onClick={handleOpenFile}>Open CBZ file...</Button>
      </div>
      {lastFileHandle && (
        <div>
          <Button onClick={handleOpenLastFile}>
            Open last file: "{lastFileHandle.name}"
          </Button>
        </div>
      )}
    </>
  );
}