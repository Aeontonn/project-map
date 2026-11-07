# Project Map

A visual board of all your projects. Drag cards anywhere, resize them, and jump straight to any project.

## Run it

```bash
npm install
npm run dev
```

Then open the link it prints (usually http://localhost:5173).

## How to use

- **Move**: drag a card anywhere. The board is infinite, scroll or drag the background to pan, scroll to zoom.
- **Resize**: click a card, then drag the corner/edge handles.
- **Edit / delete**: double-click a card.
- **Jump to a project**: press `Ctrl+K` (`Cmd+K` on Mac), type a name, press Enter.
- **Show all**: zooms out to fit every project.

Everything is saved in your browser (localStorage) automatically.

## Files

- `src/App.tsx` – the board, toolbar, shortcuts, saving
- `src/ProjectCard.tsx` – how one project card looks (and its resize handles)
- `src/ProjectDialog.tsx` – the add/edit form
- `src/QuickJump.tsx` – the Ctrl+K search box
- `src/storage.ts` – saving and loading
- `src/types.ts` – the shape of a project

Built with React, TypeScript, Vite and React Flow (`@xyflow/react`).
