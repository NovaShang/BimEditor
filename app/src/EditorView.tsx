import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  EditorProvider,
  useEditorDispatch,
  DataSourceProvider,
  useDataSource,
  loadProject,
  loadGrids,
  loadLayer,
  EditorShell,
  TooltipProvider,
} from 'bimdown-editor';
import type { DataSource } from 'bimdown-editor';
import { ArrowLeft, Download, FolderOpen } from 'lucide-react';
import type { MemoryDataSource } from './dataSources/memory.ts';
import { downloadProjectAsZip } from './dataSources/zip.ts';
import { createFileSystemDataSource } from './dataSources/fileSystem.ts';

interface EditorViewProps {
  ds: DataSource;
  projectName: string;
  memoryHandle?: MemoryDataSource;
  onBack: () => void;
  onDataSourceChange?: (ds: DataSource) => void;
}

function EditorInner({ projectName }: { projectName: string }) {
  const dispatch = useEditorDispatch();
  const ds = useDataSource();

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      const [project, grids] = await Promise.all([loadProject(ds), loadGrids(ds)]);
      if (active) {
        dispatch({ type: 'SET_PROJECT', model: projectName, project, grids });
      }
    };

    loadData();

    const disconnect = ds.watchChanges(async (path) => {
      const parts = path.split('/');
      if (parts.length < 2) { loadData(); return; }

      const levelId = parts[0]!;
      const fileName = parts.slice(1).join('/');

      if (levelId === 'global' && fileName === 'level.csv') {
        loadData();
        return;
      }
      if (levelId === 'global' && fileName === 'grid.csv') {
        const grids = await loadGrids(ds);
        if (active) dispatch({ type: 'UPDATE_GRIDS', grids });
        return;
      }

      let tableName = '';
      if (fileName.endsWith('.csv')) tableName = fileName.slice(0, -4);
      else if (fileName.endsWith('s.svg')) tableName = fileName.slice(0, -5);

      if (tableName) {
        const layer = await loadLayer(ds, levelId, tableName);
        if (layer && active) {
          dispatch({ type: 'UPDATE_LAYER', levelId, layer });
        }
        return;
      }

      loadData();
    });

    return () => {
      active = false;
      disconnect();
    };
  }, [dispatch, ds, projectName]);

  return <EditorShell />;
}

export default function EditorView({ ds, projectName, memoryHandle, onBack, onDataSourceChange }: EditorViewProps) {
  const { t } = useTranslation();

  const handleDownloadZip = useCallback(async () => {
    if (memoryHandle) {
      await downloadProjectAsZip(memoryHandle.getFiles(), projectName);
    }
  }, [memoryHandle, projectName]);

  const handleSaveToFolder = useCallback(async () => {
    if (!('showDirectoryPicker' in window)) return;
    try {
      const handle = await window.showDirectoryPicker!({ mode: 'readwrite' });
      if (memoryHandle) {
        const fsDs = await memoryHandle.transitionToFs(handle);
        onDataSourceChange?.(fsDs);
      } else {
        const fsDs = createFileSystemDataSource(handle);
        onDataSourceChange?.(fsDs);
      }
    } catch {
      // User cancelled picker
    }
  }, [memoryHandle, onDataSourceChange]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-1 px-2 h-9 shrink-0 border-b border-border bg-[var(--bg-panel)]">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] text-[12px]"
          title={t('Back')}
        >
          <ArrowLeft size={14} />
        </button>
        <span className="text-[12px] font-medium text-[var(--text-primary)] truncate">{projectName}</span>
        <div className="flex-1" />
        {memoryHandle && (
          <button
            onClick={handleDownloadZip}
            className="flex items-center gap-1 px-2 py-1 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] text-[11px]"
            title={t('Download ZIP')}
          >
            <Download size={13} />
            <span className="hidden sm:inline">ZIP</span>
          </button>
        )}
        {'showDirectoryPicker' in window && (
          <button
            onClick={handleSaveToFolder}
            className="flex items-center gap-1 px-2 py-1 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] text-[11px]"
            title={t('Save to Folder')}
          >
            <FolderOpen size={13} />
            <span className="hidden sm:inline">{t('Save to Folder')}</span>
          </button>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <TooltipProvider>
          <DataSourceProvider ds={ds}>
            <EditorProvider>
              <EditorInner projectName={projectName} />
            </EditorProvider>
          </DataSourceProvider>
        </TooltipProvider>
      </div>
    </div>
  );
}
