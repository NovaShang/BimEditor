import { useState, useCallback, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import type { DataSource } from 'bimdown-editor';
import { createLocalDataSource } from 'bimdown-editor';
import LandingPage from './LandingPage.tsx';
import EditorView from './EditorView.tsx';
import { createMemoryDataSource } from './dataSources/memory.ts';
import type { MemoryDataSource } from './dataSources/memory.ts';
import { createFileSystemDataSource } from './dataSources/fileSystem.ts';
import { EMPTY_PROJECT_FILES } from './templates/emptyProject.ts';

type AppState =
  | { view: 'landing' }
  | { view: 'editor'; ds: DataSource; name: string; memoryHandle?: MemoryDataSource };

class ErrorBoundary extends Component<{ children: ReactNode; onError?: () => void }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#1a1a1a', color: '#ccc', fontFamily: 'system-ui' }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>&#x26A0;</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 16, color: '#fff' }}>Something went wrong</h2>
            <p style={{ margin: '0 0 16px', fontSize: 13, opacity: 0.7 }}>{this.state.error.message}</p>
            <button
              onClick={() => { this.setState({ error: null }); this.props.onError?.(); }}
              style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #444', background: '#2c2c2c', color: '#fff', cursor: 'pointer', fontSize: 13 }}
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [state, setState] = useState<AppState>({ view: 'landing' });

  const handleNewProject = useCallback(() => {
    const mem = createMemoryDataSource(EMPTY_PROJECT_FILES);
    setState({ view: 'editor', ds: mem.dataSource, name: 'Untitled', memoryHandle: mem });
  }, []);

  const handleOpenFolder = useCallback(async () => {
    try {
      const handle = await window.showDirectoryPicker!({ mode: 'readwrite' });
      const ds = createFileSystemDataSource(handle);
      setState({ view: 'editor', ds, name: handle.name });
    } catch {
      // User cancelled
    }
  }, []);

  const handleOpenSample = useCallback(() => {
    const ds = createLocalDataSource('merged');
    setState({ view: 'editor', ds, name: 'Sample' });
  }, []);

  const handleBack = useCallback(() => {
    setState({ view: 'landing' });
  }, []);

  const handleDataSourceChange = useCallback((ds: DataSource) => {
    setState(prev => prev.view === 'editor' ? { ...prev, ds, memoryHandle: undefined } : prev);
  }, []);

  if (state.view === 'landing') {
    return <LandingPage
      onNewProject={handleNewProject}
      onOpenFolder={handleOpenFolder}
      onOpenSample={import.meta.env.DEV ? handleOpenSample : undefined}
    />;
  }

  return (
    <ErrorBoundary onError={handleBack}>
      <EditorView
        key={state.name + '-' + (state.memoryHandle ? 'mem' : 'fs')}
        ds={state.ds}
        projectName={state.name}
        memoryHandle={state.memoryHandle}
        onBack={handleBack}
        onDataSourceChange={handleDataSourceChange}
      />
    </ErrorBoundary>
  );
}
