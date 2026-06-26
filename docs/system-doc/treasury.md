# The Treasury

---
## Overview
The **Treasury** is the financial hub of the app, handling expense categorisation, multi‑currency selection, and automated budgeting alerts.

## Key Features
- **Categorised Expense Tracking** – Log expenses by category, view pie‑chart breakdowns.
- **Multi‑Currency Selectors** – Choose from a curated list of world currencies; values update globally via the Zustand store.
- **Automated Budget Warnings** – Real‑time alerts when expenses approach or exceed set limits.
- **Currency Symbol Helper** – Dynamically resolves symbols (e.g., `₹`, `$`, `€`) using the store helper `getCurrencySymbol`.

## Technical Highlights
- Implemented in `MoneyModule.tsx` with a glass‑morphism UI and micro‑animations.
- State (`currency`, `setCurrency`) lives in `useNectStore.ts` and persists to local storage.
- Uses Recharts `PieChart` for visualising expense distribution.
- Integrated with the global settings panel (`ControlPanelDrawer.tsx`) for seamless currency changes.
