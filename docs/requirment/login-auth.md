Markdown
# 📄 Requirements Specification: `login-auth` Portal

## 🛠️ Overview
- **Target File Location:** `/src/app/page.tsx`
- **Global Theme Location:** `/src/app/globals.css`
- **Tech Stack:** Next.js (App Router), React 19, Tailwind CSS v4, Lucide React (Icons)
- **Execution Target:** Pixel-perfect frontend implementation utilizing local client-side state hooks. No database or API integrations are required in this phase.

---

## 1. Tailwind CSS v4 Animation Infrastructure

To ensure premium micro-interactions and eliminate static UI layouts, the agent must inject these explicit custom animations into the `@theme` directive inside the project's core CSS layer.

### 💾 Configuration File: `/src/app/globals.css`
```css
@import "tailwindcss";

@theme {
  /* Cinematic Motion Variables for Tailwind v4 */
  --animate-fade-in-up: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  --animate-float: float 5s ease-in-out infinite;
  --animate-glow-pulse: glow-pulse 4s ease-in-out infinite;

  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes glow-pulse {
    0%, 100% { opacity: 0.15; transform: scale(1); }
    50% { opacity: 0.35; transform: scale(1.08); }
  }
}
2. Empty Space Canvas & Hype Layout
The interface must avoid a dead black backdrop. The outer boundaries surrounding the primary authentication card must dynamically pitch the concept of "Leveling Up Your Life" utilizing ambient visuals.

🌌 Background Environment
Ambient Lighting: Implement two or three absolute-positioned atmospheric background glow spots behind the UI layers to make the layout feel expansive:

TypeScript
<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-glow-pulse pointer-events-none" />
<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-glow-pulse pointer-events-none" />
👑 The Floating Branding Space (Positioned Directly Above the Box)
Apply the animate-float class to this container to make the logo and tagline gently hover over the canvas.

Header Structure:

Main Typography: NECT (Stylized with a striking gradient like bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 text-transparent bg-clip-text font-black text-5xl tracking-wider).

Tagline: "Level Up Your Life. One Module At A Time."

⚔️ The Outer Copy Space: "Why Nect Is Important"
Distribute these copywriting items elegantly around the lower or side empty space of the browser viewport to fill out the page:

Total Life Gamification (The Level Up Concept):

“Stop tracking your life on messy spreadsheets. Nect treats your daily habits like an RPG. Gain experience points, track your consistency streaks, and watch your personal metrics level up across learning, fitness, and finance.”

Unified Command Center (The Core Value):

“Context-switching ruins focus. When your tasks, your budget, and your workout routines are scattered across five different apps, you lose momentum. Nect unifies your entire day into a single command center so you spend less time management-hopping and more time execution-crushing.”

The 5-Core Synergy Matrix (Module Teaser Badges):

🧠 Learning Hub · 💪 Exercise Tracker · 🍏 Food Diary · 💰 Ledger Matrix · 📋 Tasks & Agenda

3. The Authentication Box (Central Interface Card)
A distinct, highly polished floating box centered within the page layout.

Card Styling: bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full animate-fade-in-up

Dynamic Switch Engine: The contents of this box are entirely dynamic and controlled via a clean React switch engine:

TypeScript
const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot'>('login');
Whenever authView changes, the form contents must smoothly transition into place using a clean entry fade.

🔐 Form View 1: Sign In (Default State)
Header: "Welcome Back"

Input Field A: Username (Clean placeholder, border transition focus hooks).

Input Field B: Password (Type password with a clickable eye icon toggler component that exposes the text value on request).

Sub-Actions Layout: A small text link reading "Forgot Password?" that calls setAuthView('forgot').

Primary Execution Button: A full-width action bar (bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]).

Footer Frame: Text reading "New to Nect? Create an account", where the anchor link updates state to setAuthView('signup').

📝 Form View 2: Create Account (Signup State)
Header: "Create Your Account"

Input Field A: Username

Input Field B: Email Address

Input Field C: Password (Features hidden eye-toggle visibility controls).

Input Field D: Confirm Password

Primary Execution Button: A full-width accent action bar (bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]).

Form Verification Guard: If Password !== Confirm Password, the submit button must be grayed out/disabled, and the input wrappers must light up with a sharp crimson outline accompanied by an error string reading "Passwords do not match."

Footer Frame: Text reading "Already have an account? Log In", calling setAuthView('login').

🔄 Form View 3: Recover Password (Forgot State)
Header: "Reset Password"

Sub-Instructional text: "Enter your registered email below and we will dispatch a secure recovery token link to restore your account access status."

Input Field A: Email Address

Primary Execution Button: A full-width utility link processing bar ("Send Reset Link").

Footer Frame: An anchor link reading "Back to Login" that securely switches the UI state directly back to setAuthView('login').

4. Input Field Behavioral Requirements
To make the fields feel tactile and responsive, the agent must ensure that all input markup matches these Tailwind conditions:

Focus Transition States: transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none

Form Submission Hijack: Every form must contain a built-in e.preventDefault() trigger that surfaces standard client-side alerts representing successful form submissions (e.g., alert("Login simulation fired.")).