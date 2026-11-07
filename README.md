# Project Map

A visual board of all your own projects. Every project is a card with a picture, status and links. Drag cards anywhere, group them in zones, connect related ones, and jump straight into any project.

## Features

- **Free board**: drag cards anywhere on an infinite board, pan and zoom, resize cards (text scales with the card)
- **Quick jump**: `Ctrl+K` (`Cmd+K` on Mac) finds a project or zone and flies the view to it
- **GitHub auto-fill**: paste a repo URL and the card fills in its name, description, language and "last touched" date. Linked cards refresh each time the app opens.
- **Images**: drop an image on a card, upload one in the form, or paste a screenshot with `Ctrl+V`
- **Zones**: coloured areas like "Portfolio" or "Side income". Cards inside a zone move along with it.
- **Lines**: connect related projects, with an optional label
- **Auto-save**: everything is saved in your browser (localStorage)

## Run it

```bash
npm install
npm run dev
```

Then open the link it prints (usually http://localhost:5173).

## How to use

| To... | Do this |
| --- | --- |
| Add a project or zone | `+ New project` / `+ Zone` in the toolbar |
| Edit or delete | Double-click a card, zone or line |
| Resize | Click a card or zone, then drag its handles |
| Connect two projects | Hover a card, drag one of its edge dots onto another card |
| Remove a line | Click it and press `Delete` |
| See everything | `Show all` |

## Code layout

```
src/
  main.tsx       starts the app
  index.css      all styles
  board/         the board itself: App, Ctrl+K search, saving, shared types, hooks
  projects/      project cards, their form, GitHub and image helpers
  zones/         zones and their form
  lines/         lines between projects and their form
  ui/            small shared pieces (the popup frame)
```

Built with React, TypeScript, Vite and React Flow (`@xyflow/react`).
