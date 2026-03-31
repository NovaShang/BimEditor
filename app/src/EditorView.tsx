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
import { ArrowLeft, Download, FolderOpen, Sun, Moon } from 'lucide-react';
import type { MemoryDataSource } from './dataSources/memory.ts';
import { downloadProjectAsZip } from './dataSources/zip.ts';
import { createFileSystemDataSource } from './dataSources/fileSystem.ts';
import { setLanguage } from './i18n.ts';
import { useTheme } from './theme.ts';

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
      // Ignore non-project files (e.g. .DS_Store)
      if (!path.endsWith('.csv') && !path.endsWith('.svg') && !path.endsWith('.json')) return;

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
      else if (fileName.endsWith('.svg')) tableName = fileName.slice(0, -4);

      if (tableName) {
        const layer = await loadLayer(ds, levelId, tableName);
        if (layer && active) {
          dispatch({ type: 'UPDATE_LAYER', levelId, layer });
        }
      }
    });

    return () => {
      active = false;
      disconnect();
    };
  }, [dispatch, ds, projectName]);

  return <EditorShell />;
}

export default function EditorView({ ds, projectName, memoryHandle, onBack, onDataSourceChange }: EditorViewProps) {
  const { t, i18n } = useTranslation();
  const { resolved, toggle } = useTheme();

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

  const handleToggleLang = useCallback(() => {
    const next = i18n.language === 'zh' ? 'en' : 'zh';
    setLanguage(next);
  }, [i18n.language]);

  return (
    <div className="relative h-full w-full">
      <TooltipProvider>
        <DataSourceProvider ds={ds}>
          <EditorProvider>
            <EditorInner projectName={projectName} />
          </EditorProvider>
        </DataSourceProvider>
      </TooltipProvider>

      {/* Floating top-left: back + project name */}
      <div className="glass-panel absolute top-3 left-3 z-40 flex items-center gap-2 rounded-xl border border-[var(--panel-border)] px-3 py-2 shadow-[var(--shadow-panel)]">
        <button
          onClick={onBack}
          className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          title={t('Back')}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="h-4 w-px bg-[var(--panel-border)]" />
        <span className="text-[13px] font-semibold tracking-tight text-[var(--text-bright)]">{projectName}</span>
      </div>

      {/* Floating top-right: actions */}
      <div className="absolute top-3 right-3 z-40 flex items-center gap-2">
        {memoryHandle && (
          <button
            onClick={handleDownloadZip}
            className="glass-panel flex h-9 items-center gap-1.5 rounded-xl border border-[var(--panel-border)] px-3 shadow-[var(--shadow-panel)] text-[var(--text-dim)] hover:text-[var(--text-bright)] text-[12px] transition-colors"
            title={t('Download ZIP')}
          >
            <Download size={14} />
            <span>ZIP</span>
          </button>
        )}
        {'showDirectoryPicker' in window && (
          <button
            onClick={handleSaveToFolder}
            className="glass-panel flex h-9 items-center gap-1.5 rounded-xl border border-[var(--panel-border)] px-3 shadow-[var(--shadow-panel)] text-[var(--text-dim)] hover:text-[var(--text-bright)] text-[12px] transition-colors"
            title={t('Save to Folder')}
          >
            <FolderOpen size={14} />
          </button>
        )}
        <button
          onClick={handleToggleLang}
          className="glass-panel flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--panel-border)] shadow-[var(--shadow-panel)] text-[var(--text-dim)] hover:text-[var(--text-bright)] text-[11px] font-medium transition-colors"
        >
          {i18n.language === 'zh' ? 'EN' : '中'}
        </button>
        <button
          onClick={toggle}
          className="glass-panel flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--panel-border)] shadow-[var(--shadow-panel)] text-[var(--text-dim)] hover:text-[var(--text-bright)] transition-colors"
        >
          {resolved === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </div>
  );
}
