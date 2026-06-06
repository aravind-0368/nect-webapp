Markdown
# 📄 Requirements Specification: SHELL, PROFILE & SETTINGS Modules

## 🛠️ Module Overview
- **Target File Location:** `/src/app/layout.tsx` (Global Shell) and `/src/app/settings/page.tsx` (Control Panel)
- **Tech Stack:** Next.js (App Router), React 19, Tailwind CSS v4, Lucide React (Icons)
- **Execution Target:** The structural framing shell of the application providing global navigation architecture across all core modules, paired with a comprehensive personal management space. The control panel is structured using a permanent left-aligned workspace sidebar to seamlessly toggle between the **Profile** and **Settings** sheets.

---

## 1. Global Navigation Shell (The Main View)

The master frame provides a persistent sidebar or header navigation interface wrapping around every functional sub-module view.

### 🧭 Navigation Blueprint Rules
- **The Branding Matrix:** Left-aligned prominent display area rendering the application text-logo: `NEXT LOGO`.
- **The Core Router Matrix:** Centered layout button tabs mapping navigation routing directly across all available functional workspaces:
  `[ Dashboard ]` | `[ Workout ]` | `[ Food ]` | `[ Learning ]` | `[ Money ]` | `[ Tasks ]`
- **The Landing Initialization State:** Upon user authentication, the global router system overrides fallback paths and defaults natively to the **Dashboard View**.
- **The Action Anchor:** Permanently pinned in the top-right corner sits an accessible configuration gear icon (`lucide Settings`). Clicking this shifts the primary workspace interface into the sidebar-driven layout detailed below.

---

## 2. Left-Sidebar Management Layout Architecture

When the configuration interface is accessed, the workspace splits into a dual-column layout containing a fixed menu on the left and a dynamic display viewport on the right.

```text
+-----------------------------------------------------------------------------------------+
| [ Left-Sidebar Navigation Column ]   | [ Active Content Target Panel Viewport ]         |
| 👤 Profile Tab Button                |                                                  |
| ⚙️ Settings Tab Button               | Renders active screen state based on selection   |
+-----------------------------------------------------------------------------------------+
3. Profile Management Viewport (Left-Sidebar Tab 1)
A clean personal information management workspace protecting identity credentials and indexing current milestone achievements.

📋 Feature Layout Criteria
The Cosmic Identity Block: Headlining text component displaying the user's current Profile Name, validated Email address, their designated Cosmic Rank Title, and their unmasked total cumulative numerical points tracker.

Masked Security Rows: The active password text must be securely masked with dot vectors by default. The row must contain a visibility action button (lucide Eye / lucide EyeOff) that safely unmasks the raw string text locally.

The Password Mutation Form: Clicking the [ Change Password ] action button dynamically expands an inline accordion containing three secure text boxes:

New Password

Confirm New Password

[ Save New Changes ] (Overwrites the local security state and collapses the form).

Session Termination Node: A highly visible layout button labeled [ Log Out ] permanently anchored at the absolute base boundary of the profile view container.

4. Settings Control Engine Viewport (Left-Sidebar Tab 2)
A powerful workspace engine empowering users to dictate application behavioral logic, rearrange system dashboards, or adjust cross-module processing rules.

🎛️ Widget Reordering Architecture
The Reordering Grid: Users can completely restructure the visual layout stack of the Main Dashboard. Except for the central Cosmic Rank Engine Progress Circle (which remains locked at top center), all charts are movable.

Mechanic: Provides a reordering selection matrix allowing users to toggle rows or shuffle positional indices for the Workout Consistency Radial Chart, Weekly Task Execution Bar Chart, Fuel Target Progress Gauges, Category Expense Pie Chart, Net Worth Area Spline, and Academic Trajectory Line Chart.

🧩 Module Visibility Checklist Matrix
A list of checklist configuration switches enabling users to toggle entire system pages on or off.

The Extraction Mechanism: Unchecking a system module (e.g., Money) strips its primary link option directly out of the Global Navigation Shell and drops its corresponding chart block from the active Main Dashboard layout view.

The Cross-Module Dependency Interceptor: Because underlying calculations use shared matrix fields (specifically, the Food Module calculates dynamic protein thresholds via the Weight and Height parameters tracked in the Workout Module), disabling a master dependency triggers an immutable alert overlay modal:

⚠️ Warning: Disabling the Workout module will interrupt automated metric handshakes. The Food module's target calculations will switch to static defaults.

🎨 Rank Theme Override Lock
The Component: A specialized toggle selector switch labeled [ Lock Theme to Active Rank ].

Logic Rule: When toggled On, the application automatically mutates its background aura, text glow, and accent borders using the Hex color assigned to the user's true current point rank tier.

When toggled Off, it unlocks a drop-down menu permitting the user to manually override the global visual style sheet using the theme colors of any lower rank tier they have previously conquered.

⚡ Automation Bypasses
The Component: A toggle selector switch labeled [ Auto-Approve Recurring Transactions ].

Logic Rule: When disabled, the Money module halts automatically on recurring calendar dates to show the manual Continue or Cancel interceptor message. When enabled, the confirmation gateway is completely bypassed, and recurring items are processed cleanly into the background ledger arrays automatically.

🚨 Core Destruction Trigger
A standalone, high-severity layout button labeled [ Delete Account ].

Destruction Rule: Clicking the node opens an explicit interceptor overlay forcing the user to type the precise string literal DELETE inside a prompt field before wiping the entire local storage directory, profile entities, and chronological transaction records.

5. UI Layout Wireframe Illustration
Plaintext
+---------------------------------------------------------------------------------------------------------+
|  NEXT LOGO      [ Dashboard ]  [ Workout ]  [ Food ]  [ Learning ]  [ Money ]  [ Tasks ]      [Settings] |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [CURRENT VIEW: SETTINGS SIDEBAR OPTION ACTIVE]                                                         |
|  +-----------------------+---------------------------------------------------------------------------+  |
|  |                       | 🎨 GLOBAL COSMIC THEMING INTERFACE                                        |  |
|  |  👤 Profile           | [x] Lock Theme to Active Rank                                             |  |
|  |                       |     Dropdown Select Override: [ Archon Themes (Electric Cyan)      [v] ]   |  |
|  | > ⚙️ Settings          | ------------------------------------------------------------------------- |  |
|  |                       | 🎛️ DASHBOARD CHART POSITION ARRANGEMENT GRID                              |  |
|  |                       | Row 1: [ Workout Consistency Radial Chart [v] ] Position: 1               |  |
|  |                       | Row 2: [ Net Worth Area Spline            [v] ] Position: 2               |  |
|  |                       | ------------------------------------------------------------------------- |  |
|  |                       | 🧩 INTERACTIVE SYSTEM VISIBILITY CHECKLIST MATRIX                         |  |
|  |                       | [x] Enable Task Module   [x] Enable Money Module   [ ] Enable Workout     |  |
|  |                       | ⚠️ INTERCEPTOR MODAL: Disabling Workout impacts Food module calculations.  |  |
|  |                       | ------------------------------------------------------------------------- |  |
|  |                       | ⚡ LEVERAGE SYSTEM AUTOMATIONS                                            |  |
|  |                       | [x] Auto-Approve Recurring Transactions (Bypass Money Prompts)            |  |
|  |                       | ------------------------------------------------------------------------- |  |
|  |                       | 🚨 ACCELERATED DATA PURGE                                                 |  |
|  |                       |                                                        [ DELETE ACCOUNT ] |  |
|  +-----------------------+---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
6. UI/UX Style & Motion Requirements
Dynamic Color Boundary Adaptation: All outline borders, toggle states, sidebar list indicators, and text links inside the settings workspace must seamlessly shift their styling colors based on whether the Rank Theme Override Lock is utilizing active rank parameters or a chosen legacy tier.

Glassmorphic Structure: Build the side-by-side management layout modules into cohesive glass layout panels using bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-6 min-h-[600px] flex gap-6.

Tactile Inputs: Sidebar choice buttons, toggle states, checkbox matrices, and visibility flags must respond cleanly with scale compression mechanics on hover and click events (active:scale-95 transition-transform duration-100).