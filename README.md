# VYTRON FITNESS

A premium dark fitness dashboard built with React, Vite, and TypeScript. Stage 2 adds an interactive Three.js anatomy viewer and a filterable HOME/GYM exercise library.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Structure

```text
src/
  data/                    Typed dashboard seed data
  features/training/       Three.js anatomy, exercise catalogue, session controls
  App.tsx                  Existing dashboard composition
  main.tsx                 React entry point and feature integration
  styles.css               Dashboard theme and responsive layout
```

The training studio opens from the dashboard's Workouts navigation. It includes a draggable 3D mannequin, front/back/side camera presets, clickable muscle focus, HOME/GYM and level filters, technique instructions, and basic set/rest session controls. Exercise content is local seed data; there is no backend, medical guidance, or AI service connected. The 3D model is a procedural stylized anatomical mannequin, not a medical-grade anatomy asset.
