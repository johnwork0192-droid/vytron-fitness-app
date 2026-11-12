# VYTRON FITNESS

A premium dark fitness dashboard built with React, Vite, and TypeScript. The first-stage interface includes a personalized training overview, weekly planner, workout cards, progress snapshots, and an AI Coach entry point.

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

## Project structure

```text
src/
  data/          Typed dashboard and workout seed data
  components/    Reusable UI components (reserved for upcoming feature work)
  App.tsx        Dashboard composition and initial interactions
  main.tsx       React entry point
  styles.css     Theme, responsive layout, and component styling
```

The dashboard is structured to evolve into dedicated 3D body-model, training, AI Coach, and account features in later stages. Current workout and dashboard data is local seed data; no backend or AI service is connected yet.
