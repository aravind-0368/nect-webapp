Markdown
# 📄 Requirements Specification: TASK Module

## 🛠️ Module Overview
- **Target File Location:** `/src/app/task/page.tsx`
- **Tech Stack:** Next.js (App Router), React 19, Tailwind CSS v4, Lucide React (Icons)
- **Execution Target:** A high-fidelity productivity checklist engine that allows users to register, organize, and prioritize daily objectives. Completing a task triggers a hidden gamification point allocation engine based on item difficulty, rendering the real-time data cleanly inside an interactive status grid matrix.

---

## 1. Functional System Rules

### ⚙️ Hidden Priority Reward Engine
- Tasks are categorized by difficulty and importance. Completing a task triggers a point calculation that updates the global profile state silently in the background. 
- **Point Allocation System:**
  - **🟢 Low Priority Completion:** Awards **+10 Points** to the global profile dashboard state.
  - **🟡 Medium Priority Completion:** Awards **+15 Points** to the global profile dashboard state.
  - **🔴 High Priority Completion:** Awards **+20 Points** to the global profile dashboard state.
- *Strict Rule: Cumulative points are completely hidden from this view and are tracked/displayed exclusively on the main dashboard layout.*

### 🔄 State & Status Mechanics
- Every task maintains a binary tracking state: `Complete` or `Not Complete`.
- Transitioning an item to `Complete` applies an instantaneous stylistic modification across its entire table row container.
- Reverting an item to `Not Complete` strips the completed visual styling and safely decrements the corresponding priority points from the global profile state to prevent duplication abuse.

---

## 2. Core Workspace Components

### ➕ Task Intake Form
- A persistent, streamlined input layout containing the following parameters:
  1. **Task Title/Description:** A text field box capturing the objective (e.g., *"Deploy code modules to staging"*).
  2. **Priority Segment Selector:** A premium horizontal button matrix row or segmented control containing three explicitly styled options:
    - `[ Low ]` (Indigo/Slate Theme)
    - `[ Medium ]` (Amber Theme)
    - `[ High ]` (Rose Theme)
  3. **Action Button:** Clicking `[ Add Task ]` appends the object into the master list array state.

---

## 3. Data Visualization Grid

### 📋 Main Interactive Task Table
- **UI Placement:** Positioned directly below the intake form.
- **Table Row Layout Columns:** `STATUS` | `TASK DESCRIPTION` | `PRIORITY LEVEL` | `ACTIONS`
- **Interactive Component Properties:**
  - **Status Column:** Features a prominent, tactile checkbox or custom click-target toggle.
  - **Priority Level Badge:** Displays a colored structural pill matching the task's tier:
    - **Low Badge:** Muted slate styling (`text-slate-400 bg-slate-500/10 border border-slate-800`).
    - **Medium Badge:** Warning amber styling (`text-amber-400 bg-amber-500/10 border border-amber-500/20`).
    - **High Badge:** Urgent crimson styling (`text-rose-400 bg-rose-500/10 border border-rose-500/20`).
  - **Tactile Completion Overlay:** When a row's checkbox transitions to `Complete`, the entire text line applies a smooth, low-opacity strikeout filter (`line-through text-slate-500 opacity-40 transition-all duration-300`).
  - **Actions Column:** Displays an accessible erase icon (`lucide Trash`). Clicking this instantly drops the record from the tracker state entirely.

---

## 4. UI Layout Wireframe Illustration

```text
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [CheckSquare Icon] TASK MANAGEMENT                                                                     |
|                                                                                                         |
|  +---------------------------------------------------------------------------------------------------+  |
|  | ➕ CREATE NEW TASK OBJECTIVE                                                                       |  |
|  | Task Title / Description:               Select Priority Tier:                                     |  |
|  | [ Review code functional modules    ]   ( ) Low    (*) Medium    ( ) High                             |  |
|  |                                                                                       [ ADD TASK ]|  |
|  +---------------------------------------------------------------------------------------------------+  |
|                                                                                                         |
|  📋 DAILY OBJECTIVE MATRIX LOG                                                                          |
|  +----------------------------------------------------------------------------------------------------+ |
|  |  STATUS        TASK DESCRIPTION                       PRIORITY LEVEL        ACTIONS                  | |
|  |  [ ] Pending   Refactor Next.js dashboard routing     [ 🔴 High ]           [ Trash Icon ]           | |
|  |  [x] Done      Optimize database queries              [ ⚠️ Medium ]         [ Trash Icon ]           | |
|  |  [x] Done      Update markdown document files         [ 🟢 Low ]            [ Trash Icon ]           | |
|  +----------------------------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------------+
5. UI/UX Style & Motion Requirements
Frosted Card Architecture: Wrap the module sections inside premium glassmorphic framing boundaries using bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 p-6 rounded-2xl.

Focus Transition Indicators: Form elements must leverage Tailwind focus modifiers to produce clean, sharp indigo glow rings when active (transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none).

Tactile Button Compression: Task additions, priority selectors, and deletion commands must briefly compress downwards on click to feel satisfyingly physical (active:scale-95 transition-transform duration-100).