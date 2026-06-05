import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function downloadProjectAsZip(
  files: Map<string, string | ArrayBuffer>,
  projectName = 'bimdown-project',
): Promise<void> {
  const zip = new JSZip();
  for (const [path, content] of files) {
    zip.file(path, content);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${projectName}.zip`);
}

/** File extensions that must be read as binary (ArrayBuffer) instead of text. */
const BINARY_EXTENSIONS = new Set(['.glb', '.gltf', '.obj', '.bin', '.png', '.jpg', '.jpeg', '.webp']);

function isBinaryFile(path: string): boolean {
  const ext = path.slice(path.lastIndexOf('.')).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

export async function loadProjectFromZip(blob: Blob): Promise<Map<string, string | ArrayBuffer>> {
  const zip = await JSZip.loadAsync(blob);
  const files = new Map<string, string | ArrayBuffer>();
  const promises: Promise<void>[] = [];

  zip.forEach((relativePath, entry) => {
    if (entry.dir) return;
    // Skip macOS resource forks and hidden files
    if (relativePath.startsWith('__MACOSX/') || relativePath.includes('/.__')) return;
    if (isBinaryFile(relativePath)) {
      promises.push(
        entry.async('arraybuffer').then((content) => {
          files.set(relativePath, content);
        }),
      );
    } else {
      promises.push(
        entry.async('string').then((content) => {
          files.set(relativePath, content);
        }),
      );
    }
  });

  await Promise.all(promises);

  // Detect single-root-folder wrapping and strip prefix
  const paths = [...files.keys()];
  if (paths.length > 0) {
    const firstSlash = paths[0]!.indexOf('/');
    if (firstSlash > 0) {
      const prefix = paths[0]!.slice(0, firstSlash + 1);
      if (paths.every((p) => p.startsWith(prefix))) {
        const stripped = new Map<string, string | ArrayBuffer>();
        for (const [p, c] of files) {
          stripped.set(p.slice(prefix.length), c);
        }
        return stripped;
      }
    }
  }

  return files;
}
