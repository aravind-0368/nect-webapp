# Training Room

---
### Overview
The **Training Room** is the strength hub of the app, dedicated to logging workouts, tracking performance, and computing dynamic formulas for progress.

### Key Features
- **Workout Logging** – Record sets, reps, weight, and duration for each exercise.
- **Dynamic Formulas** – Automatic calculation of total volume, personal bests, and streaks.
- **Progress Visualisation** – Integrated charts show consistency over time.
- **Goal Setting** – Define strength targets and receive real‑time feedback.

### Technical Highlights
- Uses the `ExerciseModule.tsx` component to capture input and update the global `dob`/`streak` state.
- Data persisted in local storage under `nect_telemetry_workout` and synced with the global Zustand store.
- UI follows the premium glass‑morphism style, with hover effects and subtle micro‑animations.
