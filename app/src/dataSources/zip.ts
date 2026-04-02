import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function downloadProjectAsZip(
  files: Map<string, string>,
  projectName = 'bimdown-project',
): Promise<void> {
  const zip = new JSZip();
  for (const [path, content] of files) {
    zip.file(path, content);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${projectName}.zip`);
}

export async function loadProjectFromZip(blob: Blob): Promise<Map<string, string>> {
  const zip = await JSZip.loadAsync(blob);
  const files = new Map<string, string>();
  const promises: Promise<void>[] = [];

  zip.forEach((relativePath, entry) => {
    if (entry.dir) return;
    // Skip macOS resource forks and hidden files
    if (relativePath.startsWith('__MACOSX/') || relativePath.includes('/.__')) return;
    promises.push(
      entry.async('string').then((content) => {
        files.set(relativePath, content);
      }),
    );
  });

  await Promise.all(promises);

  // Detect single-root-folder wrapping and strip prefix
  const paths = [...files.keys()];
  if (paths.length > 0) {
    const firstSlash = paths[0]!.indexOf('/');
    if (firstSlash > 0) {
      const prefix = paths[0]!.slice(0, firstSlash + 1);
      if (paths.every((p) => p.startsWith(prefix))) {
        const stripped = new Map<string, string>();
        for (const [p, c] of files) {
          stripped.set(p.slice(prefix.length), c);
        }
        return stripped;
      }
    }
  }

  return files;
}
