# BimDown Editor

## Structure
- `editor/` — 2D/3D building editor (React + Three.js + Vite)

## Development
- Dev: `cd editor && npm run dev` (Vite, port 5174)
- Build: `cd editor && npm run build`
- TypeScript, React, Three.js, Tailwind CSS, shadcn/ui

## Architecture
- `model/` — data model: elements, parse, serialize, tableRegistry, hosted geometry, IDs
- `renderers/` — 2D SVG renderers per element type (wall, door, window, space, slab, etc.)
- `three/` — 3D view with Three.js
- `tools/` — drawing tools (line, point, polygon, hosted element placement)
- `state/` — editor state management (reducer, selectors)
- `components/` — React UI components
- `i18n/` — English and Chinese translations
- `utils/` — data loading, persistence, snap, processing

## Key Patterns
- Elements are parsed from CSV + SVG into CanonicalElement types (LineElement, PointElement, PolygonElement)
- CSV-only elements (door, window, space, opening) are parsed directly from CSV rows
- Hosted elements use `resolveHostedGeometry()` from `model/hosted.ts` for position computation
- Serialization skips SVG for CSV-only tables
- tableRegistry.ts defines all element types, their fields, defaults, and rendering config

## Git Commits
- Do NOT add `Co-Authored-By` lines or any Claude/Anthropic signature to commit messages
- Commit messages: conventional commit style, no model attribution
