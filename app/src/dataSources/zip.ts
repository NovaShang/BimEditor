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
