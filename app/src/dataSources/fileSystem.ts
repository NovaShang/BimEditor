import type { DataSource } from 'bimdown-editor';

export function createFileSystemDataSource(
  dirHandle: FileSystemDirectoryHandle,
): DataSource {
  return {
    async fetchText(path: string): Promise<string | null> {
      try {
        const parts = path.split('/');
        let dir: FileSystemDirectoryHandle = dirHandle;
        for (const part of parts.slice(0, -1)) {
          dir = await dir.getDirectoryHandle(part);
        }
        const fileHandle = await dir.getFileHandle(parts.at(-1)!);
        const file = await fileHandle.getFile();
        return await file.text();
      } catch {
        return null;
      }
    },

    async saveFile(path: string, content: string): Promise<void> {
      const parts = path.split('/');
      let dir: FileSystemDirectoryHandle = dirHandle;
      for (const part of parts.slice(0, -1)) {
        dir = await dir.getDirectoryHandle(part, { create: true });
      }
      const fileHandle = await dir.getFileHandle(parts.at(-1)!, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
    },

    watchChanges(): () => void {
      // File System Access API has no native watch capability.
      return () => {};
    },
  };
}
