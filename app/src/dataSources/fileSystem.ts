import type { DataSource } from 'bimdown-editor';

const POLL_INTERVAL = 10_000;
const SELF_WRITE_TTL = POLL_INTERVAL + 5_000;

/** Recursively collect all files under a directory handle, returning relative paths. */
async function collectFiles(
  dir: FileSystemDirectoryHandle,
  prefix: string,
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  for await (const entry of dir.values()) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.kind === 'file') {
      const file = await (entry as FileSystemFileHandle).getFile();
      result.set(path, file.lastModified);
    } else if (entry.kind === 'directory') {
      const sub = await collectFiles(entry as FileSystemDirectoryHandle, path);
      for (const [k, v] of sub) result.set(k, v);
    }
  }
  return result;
}

export function createFileSystemDataSource(
  dirHandle: FileSystemDirectoryHandle,
): DataSource {
  // Track last-modified timestamps for polling
  const selfWrites = new Map<string, number>();

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
      selfWrites.set(path, Date.now());
    },

    resolveUrl(_path: string): string {
      // FileSystem Access API doesn't provide direct URLs; callers should use fetchText + blob
      return '';
    },

    watchChanges(onFileChanged: (path: string) => void): () => void {
      let lastSnapshot = new Map<string, number>();
      let stopped = false;

      // Take initial snapshot
      collectFiles(dirHandle, '').then(snap => { lastSnapshot = snap; });

      const timer = setInterval(async () => {
        if (stopped) return;
        try {
          const current = await collectFiles(dirHandle, '');
          for (const [path, mtime] of current) {
            const prev = lastSnapshot.get(path);
            if (prev !== mtime) {
              // Skip files we wrote ourselves recently
              const writeTime = selfWrites.get(path);
              if (writeTime && Date.now() - writeTime < SELF_WRITE_TTL) continue;
              selfWrites.delete(path);
              onFileChanged(path);
            }
          }
          lastSnapshot = current;
        } catch {
          // Directory may have been removed or permission revoked
        }
      }, POLL_INTERVAL);

      return () => {
        stopped = true;
        clearInterval(timer);
      };
    },
  };
}
