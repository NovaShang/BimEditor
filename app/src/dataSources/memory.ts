import type { DataSource } from 'bimdown-editor';
import { createFileSystemDataSource } from './fileSystem.ts';

export interface MemoryDataSource {
  dataSource: DataSource;
  getFiles(): Map<string, string>;
  transitionToFs(handle: FileSystemDirectoryHandle): Promise<DataSource>;
}

export function createMemoryDataSource(
  initialFiles?: Map<string, string>,
): MemoryDataSource {
  const files = new Map<string, string>(initialFiles ?? []);
  const listeners = new Set<(path: string) => void>();

  const dataSource: DataSource = {
    async fetchText(path) {
      return files.get(path) ?? null;
    },

    async saveFile(path, content) {
      files.set(path, content);
      for (const cb of listeners) cb(path);
    },

    watchChanges(cb) {
      listeners.add(cb);
      return () => { listeners.delete(cb); };
    },
  };

  return {
    dataSource,
    getFiles: () => new Map(files),
    async transitionToFs(handle) {
      const fsDs = createFileSystemDataSource(handle);
      for (const [path, content] of files) {
        await fsDs.saveFile(path, content);
      }
      return fsDs;
    },
  };
}
