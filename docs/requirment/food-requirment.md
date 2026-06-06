Markdown
# 📄 Requirements Specification: FOOD Module

## 🛠️ Module Overview
- **Target File Location:** `/src/app/food/page.tsx`
- **Tech Stack:** Next.js (App Router), React 19, Tailwind CSS v4, Lucide React (Icons)
- **Execution Target:** A highly interactive nutrition tracking sheet divided into two seamless sub-modules: **Today's Plate** (the daily intake checklist & water engine) and **Custom Food** (the kitchen database registry). All tracking variables update cleanly via local state (`useState`).

---

## 1. Top-Left Dynamic Nutrition Target Tag
- **UI Placement:** Permanently anchored in the top-left layout header space.
- **Cross-Module Linkage:** Automatically imports or inherits the `Weight (kg)` and `Height (cm)` variables from the core Exercise module state.
- **Automated Algorithmic Calculation Engine:** 
  - **Daily Calories Target:** Calculated via a simplified metabolic formula: $\text{Weight (kg)} \times 30 \text{ kcal}$.
  - **Daily Protein Target:** Calculated via a high-performance formula: $\text{Weight (kg)} \times 2.0 \text{ grams}$.
  - **Daily Fiber Target:** Calculated standard based on profile size baseline: $\text{Height (cm)} / 7 \text{ grams}$.
- **UI Display Component:** Renders as a premium horizontal pill dashboard cleanly showing: `Target: X kcal | Yg Protein | Zg Fiber`.

---

## 2. Sub-Module Navigation Architecture
At the top of the interface, provide two persistent layout toggle buttons to shift the active view window:
1. `[ 🍽️ Today's Plate ]` Button
2. `[ 🍏 Custom Food ]` Button

---

## 3. Sub-Module A: Today's Plate (Intake Tracking & Hydration Hub)
The active execution interface where users compile their meals and water log entries throughout the day.

### 🥤 Minimalist Water Intake Engine
- **Visual Design:** A clean, standalone card featuring a water drop icon (`lucide Droplet`).
- **Control Interface:** Simple, prominent `[ + ]` and `[ - ]` button counters flanking a central value display.
- **Tracking Unit:** Increments or decrements strictly by **0.25 Liters** per click (e.g., 0.25L, 0.50L, 0.75L).
- **Goal Notification:** Once the counter crosses an optimal **3.0 Liters**, the volume tracker border shifts from cool blue to a pulsing emerald highlight.

### ⚡ Effortless Food Intake Logger Form
- **Smart Dropdown Selector:** Pulls directly from the **Custom Food** library database.
- **Dynamic Serving Tag Identifier:** As soon as a user highlights an item in the dropdown (e.g., *"Rice"*), the input row dynamically changes its trailing text unit label to display that item’s specific measurement type (e.g., *"Bowls"*, *"Grams"*, or *"Whole Fruit"*).
- **Quantity Multiplier Field:** A numeric cell where users input their portion size (e.g., entering `1.5` multiplies the underlying Custom Food macros by 1.5).
- **Action Button:** Clicking `[ Log to Today's Plate ]` injects the item into the checklist table.

### 📋 The Daily Meal Checklist Table
- **Row Columns:** `FOOD ITEM` | `QUANTITY / SERVING` | `CALORIES` | `PROTEIN` | `FIBER` | `STATUS CHECKBOX`
- **Tactile Checklist Mechanics:** Checking a box strikes through the food entry, lowers the opacity (`opacity-40 line-through transition-all duration-300`), and securely adds the totals to the day's macro accumulation.

---

## 4. Sub-Module B: Custom Food (The Kitchen Registry)
The foundational database dictionary where users configure and save food properties manually.

### ➕ Custom Intake Builder Form
- Captures the complete profile of any new recipe or food ingredient using **the 5 key tracking parameters**:
  1. **Food Item Title:** Text input string (e.g., *"Oatmeal"*).
  2. **Serving Unit Baseline Type:** Dropdown select options determining how the item is quantified (*Grams, Bowls, Whole Fruit, Milliliters, Scoops*).
  3. **Calories (kcal):** Numeric field for total calories per single unit baseline.
  4. **Protein (g):** Numeric macro field for total grams of protein.
  5. **Fiber (g):** Numeric macro field for total grams of dietary fiber.
- Clicking the action button saves the configuration array permanently into the selectable dictionary repository.

---

## 5. UI Layout Wireframe Illustration

```text
+---------------------------------------------------------------------------------------------------------+
|  +-------------------------------------------------+                                                    |
|  | TARGETS: 2,250 kcal | 150g Protein | 25g Fiber  |  <--- Top-Left Dynamic Target Tag                 |
|  +-------------------------------------------------+                                                    |
|  [Apple Icon] FOOD                                                                                      |
|                                                                                                         |
|  +---------------------------------------+                                                              |
|  | [ 🍽️ TODAY'S PLATE ]   [ 🍏 CUSTOM FOOD ] | <--- Core Sub-Module View Toggles                         |
|  +---------------------------------------+                                                              |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [CURRENT VIEW: CUSTOM FOOD ACTIVE]                                                                     |
|  +---------------------------------------------------------------------------------------------------+  |
|  | ➕ CREATE CUSTOM FOOD ENTRY                                                                        |  |
|  | Name:             Serving Unit:     Calories:     Protein:     Fiber:                             |  |
|  | [ Rolled Oats   ] [ Bowls     [v]]  [ 150 kcal ]  [ 5 g      ] [ 4 g      ]                       |  |
|  |                                                                           [ SAVE TO KITCHEN DICT ]|  |
|  +---------------------------------------------------------------------------------------------------+  |
|  |                                                                                                   |  |
|  |  🍏 SAVED KITCHEN DICTIONARY                                                                       |  |
|  |  +------------------------------------+  +------------------------------------+                   |  |
|  |  | Rolled Oats (1 Bowl)               |  | Banana (1 Whole Fruit)             |                   |  |
|  |  | 150 kcal | 5g Pro | 4g Fiber   [x] |  | 105 kcal | 1.3g Pro | 3g Fiber [x] |                   |  |
|  |  +------------------------------------+  +------------------------------------+                   |  |
|  |                                                                                                   |  |
|  +---------------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
6. UI/UX Style & Motion Requirements
Frosted Glass Containers: Wrap component cards inside high-end glassmorphic boards using bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 p-6 rounded-2xl.

Input Focus States: Utilize Tailwind focus states for crisp, vibrant ring borders on selection fields (transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none).

Tactile Button Micro-interactions: Ensure the water + and - inputs and sub-module selectors use scale compression on click animations (active:scale-95 transition-transform duration-100).