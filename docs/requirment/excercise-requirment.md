Markdown
# 📄 Requirements Specification: WORKOUT Module

## 🛠️ Module Overview
- **Target File Location:** `/src/app/exercise/page.tsx`
- **Tech Stack:** Next.js (App Router), React 19, Tailwind CSS v4, Lucide React (Icons)
- **Execution Target:** A premium frontend interface named **WORKOUT**. The layout features two interactive tab buttons acting as sub-modules: **Today's Workout** and **Weekly Plan**, using localized states (`useState`) to handle data management seamlessly.

---

## 1. Functional System Rules

### 📊 Health Telemetry (Auto-BMI Widget)
- **UI Placement:** Permanently anchored in the top-right corner across both sub-module views.
- **Inputs:** Contains two compact, minimalist numeric input fields for `Weight (kg)` and `Height (cm)`.
- **Automated Metric Engine:** Automatically computes BMI on value changes and outputs a stylized status pill:
  - **⚠️ Underweight Badge:** Muted blue styling (`text-blue-400 bg-blue-500/10`) if BMI is less than 18.5.
  - **✅ Perfect Badge:** Vibrant emerald styling (`text-emerald-400 bg-emerald-500/10`) if BMI falls between 18.5 and 24.9.
  - **🚨 Overweight Badge:** Amber/red styling (`text-amber-400 bg-amber-500/10`) if BMI is 25 or greater.
- *Note: Cumulative scores/XP are hidden from this view and are tracked exclusively on the main dashboard.*

### 🔥 Game-Mechanics & Streak Logic
- **Completion Reward:** Checking the final checkbox for the scheduled day queues **+20 Points** to the global profile state and displays a success notification.
- **The Smart Streak System:** 
  - **Active Workout Days:** Completing the checklist increments the daily streak counter by 1. Skipping an active day resets the streak counter immediately to `0`.
  - **Rest Days:** Days explicitly marked as a rest day block freeze and protect the streak value. It safely bridges the number over to the next day without resetting it to zero.

---

## 2. Sub-Module Navigation & Architecture

At the top of the interface, provide two persistent toggle buttons acting as sub-modules to switch the lower display window view:
1. `[ Today's Workout ]` Button
2. `[ Weekly Plan ]` Button

---

### 📅 View A: Weekly Plan (Management Hub)
This panel handles the addition and removal of scheduled routines into a clean layout.

#### ➕ Adding an Exercise to the Split
- An input form featuring the following configuration elements:
  1. **Day Selector Matrix Row:** Row of selectable buttons or target days (*Monday, Tuesday, Wednesday...*).
  2. **Rest Day Toggle:** A clean checkbox or switch labeled *"Rest Interval"*. Enabling this flags the selected day as a rest period.
  3. **Body Part Dropdown Selector:** Menu classifying the target area (*Chest, Arms, Legs, Back, Shoulders, Core*).
  4. **Exercise Input Parameters:** Input text fields and numerical cells to capture the exact `Exercise Name`, `Reps`, and `Sets`.
- Clicking the primary action button (`Add This Workout Plan`) injects the configured block into the matrix layout under that selected day.

#### ❌ Deleting an Exercise from the Split
- Every scheduled exercise item visible inside the weekly layout must feature an accessible delete icon (`lucide Trash`). Clicking this icon instantly wipes that specific movement block out of the routine list.

---

### ⚡ View B: Today's Workout (Execution Checklist)
A highly focused execution panel representing only the requirements for the selected calendar day.

- **The Conditional Checklist Grid:**
  - **Rest Day State:** If the active day is flagged as a rest day in the week planner, display a clean layout card stating: `💤 Active Rest Day. Your streak is completely protected!`
  - **Workout Day State:** Displays the scheduled body parts and movements as a clean matrix block grid.
    - **Row Layout Headers:** `EXERCISE` | `REPS` | `SETS` | `CHECKLIST STATUS TRACKING`
  - **Tactile Checklist Interactive Mechanics:** Clicking a tracking set checkbox instantly applies a smooth transition overlay to that specific exercise row, lowering its opacity and striking out the text label (`line-through text-slate-500 opacity-60 transition-all duration-300`).

---

## 3. UI Layout Wireframe Illustration

The visual structure inside `/src/app/exercise/page.tsx` must render as follows:

```text
+---------------------------------------------------------------------------------------------------------+
|  [Dumbbell Icon] WORKOUT                                         +-----------------------------------+  |
|  🔥 Streak: 5 Days                                               | Wt: [ 75 ] kg  | Ht: [ 180 ] cm   |  |
|                                                                  | Status:  [ PERFECT ] (Emerald)    |  |
|  +---------------------------------------+                       +-----------------------------------+  |
|  | [ TODAY'S WORKOUT ]   [ WEEKLY PLAN ] | <--- Sub-Module View Toggles                                 |
|  +---------------------------------------+                                                              |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  ACTIVE SUB-MODULE SCREEN DISPLAY CONTAINER                                                             |
|  +---------------------------------------------------------------------------------------------------+  |
|  |  DAY SPLIT ROW MATRIX:                                                                            |  |
|  |  [ Monday ]      [ Tuesday ]     [ Wednesday ]   [ Thursday ]   [ Friday ]   ...                      |  |
|  |  Chest           Arms            Legs            - Rest Day     Back                                  |  |
|  |                                                                                                   |  |
|  |  -----------------------------------------------------------------------------------------------  |  |
|  |                                                                                                   |  |
|  |  LOGGED WORKOUT DATA MATRIX VIEW:                                                                 |  |
|  |                                                                                                   |  |
|  |  EXERCISE                     REPS          SETS          CHECKLIST STATUS                        |  |
|  |  Incline Dumbbell Press       12            4             [x] S1  [x] S2  [ ] S3  [ ] S4          |  |
|  |  Cable Chest Flyes            15            3             [ ] S1  [ ] S2  [ ] S3                  |  |
|  |                                                                                                   |  |
|  +---------------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
4. UI/UX Style & Motion Requirements
Frosted Containers: Wrap the interface components inside premium glassmorphic layout cards using bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 p-6 rounded-2xl.

Input Focus Feedback: Ensure all data fields utilize Tailwind v4 focus utilities for crisp styling (transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none).

Button Micro-interactions: Every sub-module button layout must respond to user touches with a tactile scale-down compression mechanic on click (active:scale-95 transition-transform duration-100).