Markdown
# 📄 Requirements Specification: LEARNING Module

## 🛠️ Module Overview
- **Target File Location:** `/src/app/learning/page.tsx`
- **Tech Stack:** Next.js (App Router), React 19, Tailwind CSS v4, Lucide React (Icons), Recharts (or preferred charting library)
- **Execution Target:** A comprehensive learning ecosystem structured under three interactive layout tabs (Sub-Modules): **Study Table**, **Revision Vault**, and **Exam Hub**. All metrics update using reactive local states (`useState`).

---

## 1. Sub-Module Navigation Architecture

At the top of the interface, provide three persistent toggle buttons to switch the active workspace sheet:
1. `[ 📝 Study Table ]` Button
2. `[ 🔄 Revision Vault ]` Button
3. `[ 🎓 Exam Hub ]` Button

---

## 2. Top-Right High-Stakes Telemetry Widget
- **UI Placement:** Permanently anchored in the top-right corner across all three sub-module views.
- **Dynamic Content:** Displays the nearest upcoming **Main Exam** countdown tag directly inside this global context panel.
- **Automated Metric Engine:** The system parses active main exam dates against the current date to determine the countdown style:
  - **Standard Blueprint Alert:** If the exam is 10 or more days away, show `[Exam Name] in X Days` wrapped in sleek charcoal/indigo borders (`text-indigo-400 bg-indigo-500/10 border-indigo-500/20`).
  - **🚨 Crimson Crisis Alert:** If the nearest main exam is **less than 10 days away**, the top-right pill automatically shifts to an amber-red emergency style (`text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse`).
- *Note: Cumulative profile scores/XP are hidden from this view and are tracked exclusively on the main dashboard.*

---

## 3. Sub-Module A: Study Table (Time Logging & Analytics)
A focused layout split into an input tracker and an analytical dashboard.

### ➕ Study Logger Form
- **Inputs:**
  1. **Subject Name:** Text input box (e.g., *"Data Structures"*).
  2. **Duration Selectors:** Side-by-side numeric fields for `Hours` and `Minutes`.
- **Action:** Clicking `[ Add Study Session ]` stamps the entries into the local ledger.

### 📊 Time Log Dashboard
- Displays a horizontal or vertical bar grid aggregating the total cumulative hours researched or read **per day**.
- Renders an informative micro-metric summary card next to the chart showing: `Total Hours This Week` and `Most Studied Subject`.

---

## 4. Sub-Module B: Revision Vault (Retention & Streak Logic)
An interactive dashboard map tracking subjects that require active recall or periodic review.

### ➕ Quick Append Action
- A minimalist text entry input field with an `[ Add Revision Subject ]` button to quickly stack subjects into the review queue if they aren't automatically pulled over from studies.

### 📋 Checklist & Game-Mechanics
- **Horizontal Split Matrix Row:** Renders all listed revision subjects side-by-side or as list cards, each equipped with an individual execution checkbox.
- **Completion Reward (The 20-Point Drop):** Checking off **every** revision subject in the active list instantly clears the workspace, triggers a visual splash animation, and awards **+20 Points** to the global profile dashboard state.

### 🔥 Gamification Mechanic: "The Scholar's Tome Streak"
- **The Core Metric:** Every time a full round of revision is completed, the system increments a raw **"Tome Streak"** counter.
- **Visual Progression Engine:** Renders a clean numerical status display (e.g., `📚 Tome Streak: 7 Books`) coupled with clean row book icons (`lucide BookOpen`). 
- If a revision cycle is missed or left empty on an active calendar study day, the Tome Streak counter safely decays back down to zero.

---

## 5. Sub-Module C: Exam Hub (Grades, Forecasting & Triggers)
A management workspace designed to register academic grades and track high-stakes countdown targets.

### ➕ Exam Register Intake
- **Fields Required:**
  1. **Exam Title:** Text field box (e.g., *"Advanced Algorithms Final"*).
  2. **Classification Toggle:** Two mutually exclusive segmented radio buttons: `[ Normal Exam ]` or `[ Main Exam ]`.
  3. **Performance Metrics:** Two numeric cells capturing `Total Marks Possible` and `Marks Gained`.
  4. **Date Selection Picker:** Calendar field (Disabled for Normal Exams; *Mandatory for Main Exams*).

### 📈 Grade Performance Tracking Analytics
- **Recommended Chart Engine:** A smooth, responsive **Line Chart** with customized dual-dots (`Recharts <LineChart>`).
- **X-Axis:** Chronological timeline mapping the exam titles in sequence.
- **Y-Axis:** Represents the **Calculated Marks Percentage** (0% to 100%).
- **Visual Styling:** Normal exams map as solid clean slate dots along the line path, while **Main Exams** inject large, prominent glowing marker indicators so the user can visually check if their score trajectory drops or scales during major milestone exams.

---

## 6. UI Layout Wireframe Illustration

```text
+---------------------------------------------------------------------------------------------------------+
|  [Graduation Icon] LEARNING                                      +-----------------------------------+  |
|  📚 Tome Streak: 7 Books                                         | 🚨 [AI Engineering] in 4 Days     |  |
|                                                                  | Status: HIGH ALERT (Crimson/Pulse)|  |
|  +-------------------------------------------------------+       +-----------------------------------+  |
|  | [ 📝 STUDY TABLE ]   [ 🔄 REVISION VAULT ]   [ 🎓 EXAM HUB ] | <--- Core Sub-Module View Toggles     |
|  +-------------------------------------------------------+                                              |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [CURRENT VIEW: EXAM HUB ACTIVE]                                                                        |
|  +---------------------------------------------------------------------------------------------------+  |
|  | ➕ REGISTER NEW EXAM RECORD                                                                        |  |
|  | Title:                      Type:                 Total Mark:  Gained Mark:   Exam Date:          |  |
|  | [ System Architecture   ]   ( ) Normal  (*) Main  [ 100 ]      [ 88 ]         [ 2026-06-26 ]      |  |
|  |                                                                                [ SAVE EXAM DATA ] |  |
|  +---------------------------------------------------------------------------------------------------+  |
|  |                                                                                                   |  |
|  |                                                                                                   |  |
|  |  📈 CALCULATED MARK TRAJECTORY TREND LINE                                                         |  |
|  |   100% |                                                                                          |  |
|  |    80% |         * [Main Exam Marker]                                                             |  |
|  |    60% |        / \                                                                               |  |
|  |    40% |       *   \--- * [Normal Exam Marker]                                                    |  |
|  |      0% +--------------------------------------------                                             |  |
|  |           Exam 1   Exam 2   Exam 3                                                                |  |
|  +---------------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
7. UI/UX Style & Motion Requirements
Frosted Containers: Wrap the interface components inside premium glassmorphic layout cards using bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 p-6 rounded-2xl.

Input Focus Feedback: Ensure all data fields utilize Tailwind v4 focus utilities for crisp styling (transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none).

Button Micro-interactions: Every sub-module button layout must respond to user touches with a tactile scale-down compression mechanic on click (active:scale-95 transition-transform duration-100).