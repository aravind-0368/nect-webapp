Markdown
# 📄 Requirements Specification: MONEY Module

## 🛠️ Module Overview
- **Target File Location:** `/src/app/money/page.tsx`
- **Tech Stack:** Next.js (App Router), React 19, Tailwind CSS v4, Lucide React (Icons)
- **Execution Target:** A premium personal finance ledger featuring an onboarding initial balance configuration screen that unlocks a responsive dashboard tracking earnings, expenses, customizable category chips with budget thresholds, a historical transaction log ledger, and a recurring confirmation prompt system.

---

## 1. Top Global Telemetry Indicators
Once the initial balance is set, these two dynamic metrics are pinned at the top of the workspace across all views:

### 🏦 Top-Center: Net Liquidity Tag
- **UI Element:** A large, prominent focal tag exactly centered at the top of the screen.
- **Display Output:** `Total Money Left in Account: [Currency Symbol] X,XXX`
- **Logic Engine:** Dynamically calculates: $\text{Initial Balance} + \text{Total Earnings} - \text{Total Expenses}$.

### 📈 Top-Right: Monthly Net Yield Tag
- **UI Element:** A compact performance pill anchored in the upper-right corner.
- **Display Output:** `Profit of the Month: [Currency Symbol] Y,YYY`
- **Logic Engine:** Dynamically subtracts total expenses from total earnings for the active month. 
- **Adaptive Visual Theme:** If the value is $\ge 0$, it renders in emerald (`text-emerald-400 bg-emerald-500/10`). If the net yield drops below 0, it switches to a warning red styling (`text-rose-400 bg-rose-500/10`).

---

## 2. Onboarding Workflow: Phase 1 (Initial Setup)
- **The Screen State:** If the local storage or state detects that no primary balance exists, the entire dashboard is hidden behind a minimalist, centered glassmorphic prompt card.
- **Input Parameters:** A single, prominent numeric input field labeled `"Enter Current Total Capital / Balance"`.
- **Trigger Action:** Clicking `[ Initialize Account ]` saves the value to the balance state, instantly unlocking the complete Phase 2 multi-column financial dashboard.

---

## 3. Active Ledger Workspace: Phase 2 (The Dashboard)

### ➕ Core Transaction Engine
The intake panel features standard transaction logging tabs with integrated category builders.

#### 💵 Earning & Expense Submissions
- **Transaction Type Toggle:** Quick switch between `[ + Income ]` and `[ - Expense ]`.
- **Amount Input:** Numeric value field.
- **Category Dropdown Menu:** Displays existing custom labels.
- **Inline Category Creator Tool (With Budgets):** A small companion icon button `[ + ]` placed immediately next to the category dropdown. Clicking it reveals an inline popover containing:
  1. **Category Name:** Text field string.
  2. **Color Palette Picker:** A row of selectable color dot hex values (e.g., Red, Blue, Emerald, Purple, Amber).
  3. **Monthly Spending Cap (Budget Limit):** An optional numeric field defining the maximum expenditure limit allowed for this category per month.
  4. **Action:** Clicking `[ Save Category ]` instantly injects the new tag into the active dropdown array.

#### 🚨 Category Threshold Logic Engine
- The system monitors aggregate expenses against each category's monthly spending cap.
- **Warning State Tag:** If expenses for a specific category cross **80% or more** of its designated cap, the category badge dynamically turns orange/amber across the UI as a visual boundary alert.

---

### 🔄 Recurring Profiles & Gatekeeper Interceptor
- A dedicated button labeled `[ Manage Recurring Transactions ]` opens an accordion or modal panel to configure automation rules for fixed monthly overheads or salaries (e.g., *"Rent"*, *"Subscription"*).
- **The Pre-Execution Message Interceptor:** Instead of processing background charges invisibly, when a recurring transaction's billing cycle date arrives, the system halts execution and displays a high-visibility layout notification card stating:
  > `⚠️ Upcoming Recurring Transaction: [Item Name] ([Currency Symbol] X,XXX) is scheduled. Do you want to process this for this month?`
- **User Control Inputs:** Provides two distinct interactive buttons:
  - `[ Continue / Approve ]`: Fires the transaction into the active ledger list, updates the balances, and flags it as applied.
  - `[ Cancel For This Month ]`: Safely skips execution for the active month's billing block without deleting the master recurring rule.

---

## 4. History Log Ledger (Replaces Graphs)

### 📋 Recent Transaction History Log Table
- **UI Placement:** Positioned prominently in the lower section of the layout window, replacing all visual chart structures.
- **Functional Architecture:** A clean, scannable table tracking all transactions logged during the current cycle.
- **Row Columns:** `DATE` | `TRANSACTION NAME` | `CATEGORY BADGE` | `AMOUNT` | `ACTIONS`
- **Visual Properties:**
  - Income amounts display with an explicit plus sign and emerald styling (`+ [Currency] 5,000`).
  - Expense amounts display with an explicit minus sign and muted styling (`- [Currency] 150`).
  - Category Badges render utilizing the exact color hex selected during the category's creation phase.
- **Reversal Mechanics:** Every row features an accessible delete icon (`lucide Trash`). Clicking this instantly deletes that entry from the history registry, smoothly updating the top-center global liquidity pool and top-right monthly yield totals.

---

## 5. UI Layout Wireframe Illustration

```text
+---------------------------------------------------------------------------------------------------------+
|                                     +-----------------------------------------+                         |
|                                     | Total Money Left: [INR/USD] 10,000      | <--- Top-Center Tag     |
|                                     +-----------------------------------------+                         |
|  [Wallet Icon] MONEY                                                     +----------------------------+ |
|                                                                          | Profit/Month: [INR] +700   | |
|                                                                          | (Emerald Pill)             | |
|  +-----------------------------------------------------------------+     +----------------------------+ |
|  | ➕ LOG TRANSACTION                                              |                                    |
|  | Amount:        Type:              Category:        [+] Add New  |                                    |
|  | [ 1,500      ] (*) Exp  ( ) Inc   [ Food       [v] ]            | <--- [ + ] Opens Budget/Color Form |
|  |                                                                                                      |
|  | [ ADD TRANSACTION ]     [ 🔄 MANAGE RECURRING ROSTER ]                                               |
|  +----------------------------------------------------------------------------------------------------+ |
|                                                                                                         |
|  ⚠️ INTERCEPTOR PROMPT: [ Netflix ] recurring expense due.  [ CONTINUE / APPROVE ]   [ CANCEL THIS MONTH ] |
|                                                                                                         |
|  📋 RECENT TRANSACTION HISTORY LOG TABLE                                                                |
|  +----------------------------------------------------------------------------------------------------+ |
|  |  DATE        TRANSACTION NAME       CATEGORY TAG (WITH CAP ALERTS)        AMOUNT          ACTION     | |
|  |  2026-06-05  Freelance Payout       [ Business (Blue) ]                   + $1,200.00     [ Trash ]  | |
|  |  2026-06-06  Dinner Out             [ ⚠️ Food (Amber Badge >80% Cap) ]    - $120.00       [ Trash ]  | |
|  |  2026-06-06  Gym Membership         [ Health (Emerald) ]                  - $50.00        [ Trash ]  | |
|  +----------------------------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------------+
6. UI/UX Style & Motion Requirements
Frosted Layout Foundations: Components are arranged inside glassmorphic backdrops using bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 p-6 rounded-2xl.

Dynamic Input Highlights: Fields use crisp v4 selection glows. If logging an expense, the focus ring shows a subtle red hue; if logging income, it shifts to an emerald ring.

Tactile Button Compression: Transaction submissions, approval gates, and row deletions feature a scale compression effect on hover and click (active:scale-95 transition-transform duration-100).