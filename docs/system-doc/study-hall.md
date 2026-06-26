# Study Hall

---
## Overview
The **Study Hall** serves as the knowledge hub, providing a curated resource library and a deep‑learning catalog for skill acquisition.

## Key Features
- **Resource Library** – Access articles, tutorials, and reference material directly within the app.
- **Learning Streaks** – Track daily study sessions, earn experience points, and visualize progress with the study‑progress gauge.
- **Deep‑Learning Catalog** – Organise courses, mark completed modules, and view mastery levels.
- **Interactive Charts** – Recharts `LineChart` visualises weight/height telemetry tied to learning metrics.

## Technical Highlights
- Implemented in `LearningModule.tsx` (part of `DashboardModule.tsx`).
- Utilises the global Zustand store for telemetry history and revision tracking.
- UI employs glass‑morphism panels, micro‑animations on hover, and a responsive layout.
- Data persistence via `localStorage` under `nect_telemetry_learning`.
