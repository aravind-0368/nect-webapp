# System Specifications & Data & Security Policy

---

## System Specifications

**Target Platform**: This application is built as a modern **Web application** using React, TypeScript, and Tailwind‑styled components (with premium glass‑morphism UI). It runs natively in any standards‑compliant browser.

### Device Compatibility
- **Desktop & Laptop** – Full‑width layout with multi‑column dashboards. All charts, panels and interactive widgets render with SVG‑based Recharts for crisp performance.
- **Tablet (Portrait & Landscape)** – Responsive breakpoints collapse the grid to a single‑column view while preserving the premium visual aesthetics. Touch‑friendly controls (buttons, sliders) enlarge automatically.
- **Mobile Phones** – Mobile‑first breakpoints ensure vertical stacking of widgets, larger tap targets, and hidden overflow handling. The UI retains the same glass‑morphism feel and micro‑animations.
- **Progressive Web App (PWA)** – The project ships a `manifest.webmanifest` and a Service Worker that caches static assets, allowing offline access to previously loaded data and enabling **install‑to‑home‑screen** on Android, iOS (Safari) and supported desktop browsers.

### Performance & Responsiveness
- **Lazy‑loaded components** – Heavy widgets (charts, calendars) load on demand.
- **CSS custom properties** – Used for theming (dark mode, accent colors) without extra re‑renders.
- **Recharts** – SVG‑based charts are hardware‑accelerated and scale beautifully across all DPIs.
- **Zustand store with partialisation** – Persists only the necessary slices to `localStorage`, keeping start‑up payload minimal.

## Data & Security Policy

### Data Isolation
- All **user‑generated data** (workout logs, expense entries, study telemetry, tasks, currency choice, DOB) is stored **client‑side** in the browser’s **`localStorage`** under namespaced keys (e.g., `nect_telemetry_workout`, `nect_money_currency`).
- The Zustand store **partialises** each slice, ensuring that only the required fields are persisted, preventing accidental data leakage between unrelated modules.
- When the app syncs with a back‑end API (if enabled), each request includes an **auth token** scoped to the individual user, guaranteeing row‑level isolation on the server side.

### Security Measures
1. **Content Security Policy (CSP)** – The generated `index.html` ships with a strict CSP that only permits scripts from the origin and the required `blob:` for generated images.
2. **HTTPS‑only** – The app is intended to be served over TLS; all external resources (Google Fonts, icons) are fetched via `https://` URLs.
3. **X‑SS‑Protection & HSTS** – Headers are recommended for production builds to mitigate click‑jacking and man‑in‑the‑middle attacks.
4. **Local Storage Encryption (optional)** – For higher‑security deployments, the `useNectStore` can be extended with a simple AES wrapper before persisting data.
5. **No Third‑Party Tracking** – The codebase does **not** include any analytics SDKs or ad‑network scripts, keeping user privacy intact.

### Data Retention & Deletion
- Users can clear all stored information by clicking the **“Reset Settings”** button in the **Control Room**; this invokes `localStorage.clear()` for the app’s namespace.
- Because data resides locally, it is automatically removed when the user clears browser caches or uninstalls the PWA.

---

> **Note**: While the core of the app runs entirely in the browser, the architecture is ready for a secure back‑end integration should you need server‑side persistence or multi‑device sync.
