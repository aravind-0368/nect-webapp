Markdown
# 📄 Requirements Specification: MAIN DASHBOARD Module

## 🛠️ Module Overview
- **Target File Location:** `/src/app/dashboard/page.tsx`
- **Tech Stack:** Next.js (App Router), React 19, Tailwind CSS v4, Lucide React (Icons), Recharts (or preferred charting library)
- **Execution Target:** The master control center of the entire ecosystem. This module aggregates data from the Workout, Learning, Food, Money, and Task modules. It features a dark-fantasy RPG progression mechanic that dynamically alters the theme, colors, and visual aura of the entire application layout as the user climbs ranks.

---

## 1. Global Cosmic Rank Engine (Center Stage)

Instead of a raw point metric, the focal point of the dashboard is an interactive, glowing circular progress ring that fills based on earned points. 

### ⚙️ Calculation & Theme Injection Logic
- **Progress Percentage Formula:** The circle tracks point progression toward the next milestone using the following matrix:
  $$\text{Progress \%} = \left( \frac{\text{Current Points} - \text{Tier Min}}{\text{Tier Max} - \text{Tier Min}} \right) \times 100$$
- **Global CSS Mutation Engine:** The absolute point value is completely hidden from the user. They only see their active **Rank Title**. When points cross into a new tier range, the component must globally inject the respective **Hex Code Theme Color** into the application's root borders, ambient glow effects, button outlines, and text gradients.

### 🏆 The Cosmic Ranks Architecture Matrix

| Rank Title | Point Range | Next Tier Gap | Theme Color | Hex Code | The Aura Vibe |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Outcast** | $0$ – $499$ | $+500$ | Ash Gray | `#555555` | A nameless nobody forgotten by the world. |
| **Vanguard** | $500$ – $1,499$ | $+1,000$ | Blood Crimson | `#990000` | The frontline soldier who refuses to die. |
| **Sorcerer** | $1,500$ – $3,499$ | $+2,000$ | Abyssal Blue | `#00008B` | Awakened power. A master of reality-bending manipulation. |
| **Archon** | $3,500$ – $7,499$ | $+4,000$ | Electric Cyan | `#00FFFF` | A living storm. Your mere presence commands the room. |
| **Dread-General** | $7,500$ – $14,999$ | $+7,500$ | Shadow Black | `#0D0D0D` | The Shift. Commander of armies. Empires tremble at your name. |
| **High-Lord** | $15,000$ – $29,999$ | $+15,000$ | Royal Purple | `#6A0DAD` | Absolute sovereignty. You own the landscape and rule the economy. |
| **Overlord** | $30,000$ – $59,999$ | $+30,000$ | Solar Gold | `#FFD700` | Unchecked dominion. You have conquered everything in the mortal realm. |
| **Monarch** | $60,000$ – $99,999$ | $+40,000$ | Void Violet | `#4B0082` | A supreme, undying king of life and death. |
| **Demiurge** | $100,000+$ | — | Cosmic Platinum | `#E5E4E2` | The Creator. You have surpassed the system. You design the cosmos. |

---

## 2. Global "High Alert" Feed (Top Right Corner)

A critical cross-module notification station that intercepts and logs emergency flags from other pages:
- **Main Exam Countdown Tag:** Mirrors the status from the Learning module. If an exam date is **less than 10 days away**, display a pulsing, crimson-red badge: `🚨 [Exam Name] in X Days`.
- **Budget Threshold Alert:** Mirrors the financial status from the Money module. If an active spending category breaches **80% or more** of its monthly cap, flash an amber warning tag detailing the category name.

---

## 3. Comprehensive Analytics & Charts Grid

### 📊 Row A: Productive & Physical Execution
1. **Workout Consistency (From Workout Module):**
   - **Type:** 7-Day Radial Bar Chart (Circular concentric rings).
   - **Metrics:** Automatically maps daily exercise completion percentages ($0\%$ to $100\%$) as sets are checked off in the active workout split.
2. **Weekly Task Execution Ratio (From Task Module):**
   - **Type:** Grouped Dual-Bar Graph.
   - **Metrics:** Compares the total volume of daily **Completed** tasks (Emerald bars) against **Not Completed** tasks (Slate/Crimson bars) over a rolling 7-day calendar view.

### 🍎 Row B: Nutrition & Financial Flow
3. **Fuel Target Progress (From Food Module):**
   - **Type:** Stacked Horizontal Progress Gauges.
   - **Metrics:** Tracks accumulated daily consumption totals against the dynamically calculated Calorie (kcal), Protein (g), and Fiber (g) target ceilings.
4. **Category Expense Allocation (From Money Module):**
   - **Type:** Pie or Donut Chart.
   - **Metrics:** Summarizes the relative percentage distribution of monthly expenses broken down by custom user category tags, highlighting immediate capital drain.

### 📈 Row C: Strategic Trajectories
5. **Net Worth Flow (From Money Module):**
   - **Type:** Smooth Area Spline Chart.
   - **Metrics:** A continuous single-line vector plotting total residual capital over a rolling timeline to display net financial direction.
6. **Academic Trajectory Monitor (From Learning Module):**
   - **Type:** Enhanced Line Chart.
   - **Metrics:** Maps the user's recorded exam score performance percentages ($0\%$ to $100\%$). 
   - **Visual Override:** Normal exams map as subtle nodes along the spline, while **Main Exams** generate enlarged, glowing nodes to isolate macro milestone trends.

---

## 4. Analytical Micro-Metric Cards

Positioned in the lower dashboard section to provide summary readouts of weekly habits:
- **📚 Academic Sync Card:** A minimalist text comparison card tracking the explicit ratio of: `Subjects Studied vs. Revisions Completed This Week` (e.g., *5 Subjects Studied / 3 Revisions Completed*). 

---

## 5. UI Layout Wireframe Illustration

```text
+---------------------------------------------------------------------------------------------------------+
|  [COSMIC LOGO] MASTER DASHBOARD                                          +----------------------------+ |
|                                                                          | LIVE HIGH ALERT FEED       | |
|                                                                          | 🚨 [AI Final] in 4 Days    | |
|                                                                          | ⚠️ Food Cap Over 85%       | |
|                                                                          +----------------------------+ |
|                                 +-------------------------+                                             |
|                                 |      /-----------\      |                                             |
|                                 |     /             \     |                                             |
|                                 |    |    ARCHON     |    | <--- Glowing Progression Circle             |
|                                 |     \   (Cyan)    /     |      (Fills and glows based on hidden points)
|                                 |      \-----------/      |                                             |
|                                 +-------------------------+                                             |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  📊 ROW A: EXECUTION CHARTS                                                                             |
|  +---------------------------------------+    +------------------------------------------------------+  |
|  | [Radial Chart] Workout Consistency     |    | [Dual-Bar Chart] Weekly Task Ratio                   |  |
|  | M [===] T [=======] W [=] ...         |    | ■ Completed (Green)  /  ■ Not Completed (Red)        |  |
|  +---------------------------------------+    +------------------------------------------------------+  |
|                                                                                                         |
|  📊 ROW B: CONSUMPTION & CASH BLOCKS                                                                    |
|  +---------------------------------------+    +------------------------------------------------------+  |
|  | [Gauges] Fuel Targets (Cal/Pro/Fib)   |    | [Donut Chart] Expense Categories                     |  |
|  | Calories: [============] 85%          |    | Food [■] Rent [■] Subscriptions [■]                  |  |
|  +---------------------------------------+    +------------------------------------------------------+  |
|                                                                                                         |
|  📊 ROW C: LONG-TERM VECTORS                                                                            |
|  +---------------------------------------+    +------------------------------------------------------+  |
|  | [Spline Chart] Net Worth Flow         |    | [Line Chart] Academic Trajectory Monitor             |  |
|  | Balance Trend Line (Climbing/Falling) |    | 100% | --------* [Glowing Main Exam Node]            |  |
|  +---------------------------------------+    +------------------------------------------------------+  |
|                                                                                                         |
|  📋 ACADEMIC SYNC METRIC OVERVIEW                                                                       |
|  +---------------------------------------------------------------------------------------------------+  |
|  | 📚 Current Weekly Summary: 5 Subjects Logged in Study Table  |  🔄 3 Total Revisions Checked Off |  |
|  +---------------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
6. UI/UX Style & Global Theme Mutator Rules
Aura-Reactive Glassmorphism: All core containers utilize bg-slate-900/40 backdrop-blur-sm rounded-2xl p-6 transition-all duration-500. The container borders must drop standard slate stylings and inherit the active Rank Hex Code as a muted border color opacity (e.g., border-[HexCode]/30).

Dynamic Box Glows: The central rank circle component leverages a drop-shadow CSS filter utilizing the active rank color to generate a subtle environmental aura reflection on the page.

Micro-interactions: Any actionable cards or layout elements must scale down slightly on tap (active:scale-98 transition-transform duration-100).