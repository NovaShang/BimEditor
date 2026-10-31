# BimDown Editor

A browser-based 2D/3D building editor for the [BimDown](https://github.com/NovaShang/BimDown) format.

Use it at [bimdown.com](https://bimdown.com) (with an AI agent and cloud projects) or standalone at [editor.bimdown.com](https://editor.bimdown.com).

## Features

- **2D floor plan** — draw walls, place doors/windows/columns, define rooms
- **3D view** — real-time 3D visualization with Three.js
- **All building elements** — walls, doors, windows, columns, slabs, roofs, ceilings, stairs, openings, room separators, structure, MEP
- **Multi-format export** — glTF, IFC, PDF, DXF
- **Multilingual** — English and Chinese

## Getting Started

The standalone app lives in `app/`. To run it:

```bash
git clone https://github.com/NovaShang/BimEditor.git
cd BimEditor
npm install
npm run dev --workspace=app
```

Opens at http://localhost:5175. From the landing page you can create a new project, open a local folder (File System Access API), or load sample data (dev mode only).

For **component development**, run the editor workspace directly:

```bash
npm run dev --workspace=editor
```

Opens at http://localhost:5174. This requires a `sample_data/` directory at the repo root containing BimDown CSV/SVG exports.

## As a Component

The editor is designed to be embedded in other React applications. The repo uses npm workspaces — the `editor` package exports its public API from `bimdown-editor`.

You need to compose several providers around the `EditorShell` component and load data via the `DataSource` interface:

```tsx
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

function EditorInner({ projectName }: { projectName: string }) {
  const dispatch = useEditorDispatch();
  const ds = useDataSource();

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [project, grids] = await Promise.all([loadProject(ds), loadGrids(ds)]);
      if (active) dispatch({ type: 'SET_PROJECT', model: projectName, project, grids });
    };
    load();
    return () => { active = false; };
  }, [dispatch, ds, projectName]);

  return <EditorShell />;
}

function MyEditor({ ds, projectName }: { ds: DataSource; projectName: string }) {
  return (
    <TooltipProvider>
      <DataSourceProvider ds={ds}>
        <EditorProvider>
          <EditorInner projectName={projectName} />
        </EditorProvider>
      </DataSourceProvider>
    </TooltipProvider>
  );
}
```

The `DataSource` interface abstracts file I/O. Built-in factory:

- `createLocalDataSource(model)` — reads from a local dev server (`/sample_data/`)

You can also implement `DataSource` yourself for custom backends (HTTP API, IndexedDB, etc.).

### Exported API

| Export | Description |
|--------|-------------|
| `EditorProvider` | React context provider for editor state |
| `useEditorState` | Hook to read editor state |
| `useSelectionState` | Hook to read selection state |
| `useEditorDispatch` | Hook to dispatch editor actions |
| `DataSourceProvider` | React context provider for the data source |
| `useDataSource` | Hook to read the current data source |
| `createLocalDataSource` | Factory for local dev server data source |
| `loadProject` / `loadGrids` / `loadLayer` | Data loading helpers |
| `EditorShell` | Main editor UI component |
| `TooltipProvider` | Tooltip context (required by EditorShell) |
| `exportGltf` / `exportIfc` / `exportPdf` / `exportDxf` | Export functions |

## Related Projects

- **[BimDown](https://github.com/NovaShang/BimDown)**: the open-source format specification, CLI, agent skill, and Revit add-in
- **[bimdown.com](https://bimdown.com)**: the hosted app built on this editor, with an AI agent that builds models from drawings, photos, or text

## License

MIT
