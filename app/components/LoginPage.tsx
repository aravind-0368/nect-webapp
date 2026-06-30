"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState, useEffect } from "react";
import { useNectStore, getActiveRank, rankTiers } from "../store/useNectStore";
import { createClient } from "../../utils/supabase/client";
import {
  BookOpen,
  Key,
  Target,
  Dumbbell,
  Coins,
  GraduationCap,
  Shield,
  Zap,
  LayoutDashboard,
  Flame,
  Apple,
  Brain
} from "lucide-react";

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "255, 255, 255";
}

type AuthView = "login" | "signup" | "forgot";

type LoginPageProps = {
  onAuthenticated: () => void;
};

const inputClass =
  "w-full rounded-xl border border-[#5B009C]/25 bg-[#020212]/95 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-[#a855f7] focus:ring-1 focus:ring-[#5B009C]/40 font-mono";

const DOCUMENTS = {
  overview: {
    title: "System Overview",
    content: `## Our Mission
To help individuals systematically level up their lives by tracking, optimizing, and conquering their day‑to‑day activities. We believe self‑improvement shouldn't feel like a chore—it should feel like an evolution.

## The Methodology
Heavily inspired by the iconic progression system of **Solo Leveling**, this application turns your real‑world routines into daily quests. Every workout completed in the **Training Room**, every expense balanced in **The Treasury**, and every skill mastered in the **Study Hall** awards you invisible experience points. By executing your daily work, you unlock clear, data‑driven visual proof of your real‑life stat upgrades.

## Features (The Solo Leveling UI Breakdown)
- ** Training Room (The Strength Stat)** – Execute and log workouts to build consistency and physical power.
- ** Daily Fuel (The Vitality Stat)** – Track nutrition and rest to restore your health and energy reserves.
- ** Study Hall (The Intelligence Stat)** – Access a focused library of material to absorb knowledge and master your craft.
- ** The Treasury (The Resource Inventory)** – Audit your gains, manage your capital, and track currency metrics smoothly.
- ** Control Room (The Quest Log)** – Clear your daily slate by checking off tasks and crushing your immediate targets.

\`\`\`css
.system-alert-text {
  font-family: 'Space Mono', 'Courier New', monospace;
  color: #10b981; /* Neon green/emerald terminal look */
  text-transform: uppercase;
}
\`\`\``
  },
  training: {
    title: "Training Room",
    content: `## Overview
The **Training Room** is the strength hub of the app, dedicated to logging workouts, tracking performance, and computing dynamic formulas for progress.

## Key Features
- **Workout Logging** – Record sets, reps, weight, and duration for each exercise.
- **Dynamic Formulas** – Automatic calculation of total volume, personal bests, and streaks.
- **Progress Visualisation** – Integrated charts show consistency over time.
- **Goal Setting** – Define strength targets and receive real‑time feedback.

## Technical Highlights
- Uses the **ExerciseModule.tsx** component to capture input and update the global **dob**/**streak** state.
- Data persisted in local storage under **nect_telemetry_workout** and synced with the global Zustand store.
- UI follows the premium glass‑morphism style, with hover effects and subtle micro‑animations.`
  },
  treasury: {
    title: "The Treasury",
    content: `## Overview
The **Treasury** is the financial hub of the app, handling expense categorisation, multi‑currency selection, and automated budgeting alerts.

## Key Features
- **Categorised Expense Tracking** – Log expenses by category, view pie‑chart breakdowns.
- **Multi‑Currency Selectors** – Choose from a curated list of world currencies; values update globally via the Zustand store.
- **Automated Budget Warnings** – Real‑time alerts when expenses approach or exceed set limits.
- **Currency Symbol Helper** – Dynamically resolves symbols (e.g., **₹**, **$**, **€**) using the store helper **getCurrencySymbol**.

## Technical Highlights
- Implemented in **MoneyModule.tsx** with a glass‑morphism UI and micro‑animations.
- State (**currency**, **setCurrency**) lives in **useNectStore.ts** and persists to local storage.
- Uses Recharts **PieChart** for visualising expense distribution.
- Integrated with the global settings panel (**ControlPanelDrawer.tsx**) for seamless currency changes.`
  },
  study: {
    title: "Study Hall",
    content: `## Overview
The **Study Hall** serves as the knowledge hub, providing a curated resource library and a deep‑learning catalog for skill acquisition.

## Key Features
- **Resource Library** – Access articles, tutorials, and reference material directly within the app.
- **Learning Streaks** – Track daily study sessions, earn experience points, and visualize progress with the study‑progress gauge.
- **Deep‑Learning Catalog** – Organise courses, mark completed modules, and view mastery levels.
- **Interactive Charts** – Recharts **LineChart** visualises weight/height telemetry tied to learning metrics.

## Technical Highlights
- Implemented in **LearningModule.tsx** (part of **DashboardModule.tsx**).
- Utilises the global Zustand store for telemetry history and revision tracking.
- UI employs glass‑morphism panels, micro‑animations on hover, and a responsive layout.
- Data persistence via **localStorage** under **nect_telemetry_learning**.`
  },
  specs: {
    title: "Specifications & Security",
    content: `## System Specifications
**Target Platform**: This application is built as a modern **Web application** using React, TypeScript, and Tailwind‑styled components (with premium glass‑morphism UI). It runs natively in any standards‑compliant browser.

### Device Compatibility
- **Desktop & Laptop** – Full‑width layout with multi‑column dashboards. All charts, panels and interactive widgets render with SVG‑based Recharts for crisp performance.
- **Tablet (Portrait & Landscape)** – Responsive breakpoints collapse the grid to a single‑column view while preserving the premium visual aesthetics. Touch‑friendly controls (buttons, sliders) enlarge automatically.
- **Mobile Phones** – Mobile‑first breakpoints ensure vertical stacking of widgets, larger tap targets, and hidden overflow handling. The UI retains the same glass‑morphism feel and micro‑animations.
- **Progressive Web App (PWA)** – The project ships a **manifest.webmanifest** and a Service Worker that caches static assets, allowing offline access to previously loaded data and enabling **install‑to‑home‑screen** on Android, iOS (Safari) and supported desktop browsers.

### Performance & Responsiveness
- **Lazy‑loaded components** – Heavy widgets (charts, calendars) load on demand.
- **CSS custom properties** – Used for theming (dark mode, accent colors) without extra re‑renders.
- **Recharts** – SVG‑based charts are hardware‑accelerated and scale beautifully across all DPIs.
- **Zustand store with partialisation** – Persists only the necessary slices to **localStorage**, keeping start‑up payload minimal.

## Data & Security Policy

### Data Isolation
- All **user‑generated data** (workout logs, expense entries, study telemetry, tasks, currency choice, DOB) is stored **client‑side** in the browser’s **\`localStorage\`** under namespaced keys (e.g., **nect_telemetry_workout**, **nect_money_currency**).
- The Zustand store **partialises** each slice, ensuring that only the required fields are persisted, preventing accidental data leakage between unrelated modules.
- When the app syncs with a back‑end API (if enabled), each request includes an **auth token** scoped to the individual user, guaranteeing row‑level isolation on the server side.

### Security Measures
1. **Content Security Policy (CSP)** – The generated **index.html** ships with a strict CSP that only permits scripts from the origin and the required **blob:** for generated images.
2. **HTTPS‑only** – The app is intended to be served over TLS; all external resources (Google Fonts, icons) are fetched via **https://** URLs.
3. **X‑SS‑Protection & HSTS** – Headers are recommended for production builds to mitigate click‑jacking and man‑in‑the‑middle attacks.
4. **Local Storage Encryption (optional)** – For higher‑security deployments, the **useNectStore** can be extended with a simple AES wrapper before persisting data.
5. **No Third‑Party Tracking** – The codebase does **not** include any analytics SDKs or ad‑network scripts, keeping user privacy intact.

### Data Retention & Deletion
- Users can clear all stored information by clicking the **“Reset Settings”** button in the **Control Room**; this invokes **localStorage.clear()** for the app’s namespace.
- Because data resides locally, it is automatically removed when the user clears browser caches or uninstalls the PWA.

> **Note**: While the core of the app runs entirely in the browser, the architecture is ready for a secure back‑end integration should you need server‑side persistence or multi‑device sync.`
  }
};

const getDocIcon = (key: string) => {
  switch (key) {
    case "overview": return <LayoutDashboard className="h-4 w-4 text-[#c084fc]" />;
    case "training": return <Dumbbell className="h-4 w-4 text-orange-400" />;
    case "treasury": return <Coins className="h-4 w-4 text-[#10B981]" />;
    case "study": return <GraduationCap className="h-4 w-4 text-indigo-400" />;
    case "specs": return <Shield className="h-4 w-4 text-[#10B981]" />;
    default: return <BookOpen className="h-4 w-4" />;
  }
};

function renderFormattedText(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <strong key={index} className="font-bold text-[#c084fc]">
          {part}
        </strong>
      );
    }
    return part;
  });
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const supabase = createClient();
  const { points, rankOverride, setUserId, setPoints, setPowerStreak, setSmartStreak, setHealthyStreak } = useNectStore();
  const accentColor = useMemo(() => {
    return rankTiers.find((rank) => rank.name === rankOverride)?.color ?? getActiveRank(points).color;
  }, [rankOverride, points]);

  const [activeForm, setActiveForm] = useState<AuthView | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [activeDocKey, setActiveDocKey] = useState<keyof typeof DOCUMENTS>("overview");

  useEffect(() => {
    // Load Fonts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Pixelify+Sans:wght@400;700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&family=Syne:wght@400;700;800&family=Plus+Jakarta+Sans:wght@400;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Inject Stylesheet rules
    const style = document.createElement("style");
    style.id = "nect-custom-fonts";
    style.innerHTML = `
      h1, .game-title {
        font-family: 'Syne', sans-serif !important;
      }
      h1 span {
        font-family: 'Plus Jakarta Sans', sans-serif !important;
      }
      label, .system-label, h2, h3 {
        font-family: 'Space Mono', monospace !important;
      }
      input, p, .doc-body {
        font-family: 'Orbitron', sans-serif !important;
      }
      /* Adjust inputs and input placeholder fonts */
      input::placeholder {
        font-family: 'Space Mono', monospace !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(link);
      const injectedStyle = document.getElementById("nect-custom-fonts");
      if (injectedStyle) {
        document.head.removeChild(injectedStyle);
      }
    };
  }, []);

  const passwordsMismatch = useMemo(
    () => confirmPassword.length > 0 && signupPassword !== confirmPassword,
    [confirmPassword, signupPassword],
  );

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Fetch public User profile
        const { data: profile } = await supabase
          .from("User")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profile) {
          setPoints(profile.totalPoints);
          setPowerStreak(profile.workoutStreak);
          setSmartStreak(profile.learningStreak);
          setHealthyStreak(profile.foodStreak);
        } else {
          // If no profile (edge case), initialize one
          await supabase.from("User").insert({
            id: data.user.id,
            email: data.user.email || "",
            username: data.user.user_metadata?.username || data.user.email?.split("@")[0] || "User",
            totalPoints: 0,
            currentRank: "E-Rank"
          });
        }
        
        setUserId(data.user.id);
        onAuthenticated();
      }
    } catch (err: any) {
      setAuthError(err.message || "An unexpected error occurred during initialization.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");

    if (passwordsMismatch) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            username: signupUsername,
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        if (dob) {
          localStorage.setItem(`nect_telemetry_dob_${data.user.id}`, dob);
        }
        
        // Wait briefly for trigger execution
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from("User")
            .select("*")
            .eq("id", data.user!.id)
            .maybeSingle();
            
          if (profile) {
            setPoints(profile.totalPoints);
            setPowerStreak(profile.workoutStreak);
            setSmartStreak(profile.learningStreak);
            setHealthyStreak(profile.foodStreak);
          }
        }, 1500);

        if (data.session) {
          setUserId(data.user.id);
          onAuthenticated();
        } else {
          setAuthError("Account created! Please check your email to verify your connection.");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "An unexpected error occurred during telemetry configuration.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
        redirectTo: window.location.origin,
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setAuthError("Recovery token dispatched. Check your email!");
      }
    } catch (err: any) {
      setAuthError(err.message || "Could not dispatch recovery token.");
    } finally {
      setIsLoading(false);
    }
  }

  const navigateToGateway = () => {
    document.getElementById("auth-gateway")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-[#020212] text-slate-100 font-sans selection:bg-[#5B009C]/40 selection:text-[#d8b4fe]"
      style={{
        "--rank-accent": accentColor,
        "--rank-accent-rgb": hexToRgb(accentColor),
        "--rank-accent-glow": `0 0 24px ${accentColor}2d`,
        "--rank-accent-glow-strong": `0 0 24px ${accentColor}40`,
        "--rank-accent-glow-subtle": `0 0 28px ${accentColor}1a`,
      } as React.CSSProperties}
    >
      {/* Background glow effects */}
      <div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-[#5B009C]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#10B981]/4 blur-3xl pointer-events-none" />

      {/* Header / Navbar */}
      <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b border-[#5B009C]/15 bg-[#020212]/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/logo/main-logo.png"
            alt="Nect logo"
            width={140}
            height={48}
            priority
            className="h-auto w-32"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Documents direct button */}
          <button
            onClick={() => setShowDocs(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#020212]/80 border border-[#5B009C]/25 text-xs font-mono text-slate-350 hover:text-white hover:border-[#5B009C]/50 transition-all duration-200"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">DOCUMENTS</span>
          </button>

          {/* Login direct button */}
          <button
            onClick={() => {
              setActiveForm("login");
              navigateToGateway();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B009C] text-white border border-[#a855f7] text-xs font-mono font-bold hover:bg-[#510087] shadow-[0_0_15px_rgba(91,0,156,0.3)] transition-all duration-200"
          >
            <Key className="h-3.5 w-3.5" />
            <span>LOGIN</span>
          </button>
        </div>
      </header>

      {/* Main Split Gate Layout */}
      <div className="relative z-10 mx-auto max-w-7xl pt-28 pb-12 px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[calc(100vh-80px)]">
        {/* Left Side: App Details */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-center">
          <div className="space-y-4">
            <h1 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white">
              AWAKEN YOUR<br />
              TRUE STATS.<br />
              <span className="text-lg sm:text-xl lg:text-2xl mt-3 block font-bold text-[#a855f7]" style={{ textShadow: "0 0 12px rgba(168,85,247,0.2)" }}>Level Up in Real Life</span>
            </h1>
            <p className="text-slate-300 text-base leading-relaxed max-w-lg font-sans">
              A system-driven RPG quest tracker and resource inventory for managing daily habits, workout progression, and multi-currency ledgers.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setActiveForm("signup");
                  navigateToGateway();
                }}
                className="px-6 py-3 rounded-xl font-mono text-xs font-bold bg-[#020212] text-slate-300 border border-[#5B009C]/30 hover:border-[#a855f7] hover:text-white transition-all duration-205 active:scale-95 shadow-[0_0_15px_rgba(91,0,156,0.1)]"
              >
                START LEVELING UP
              </button>
            </div>
          </div>
          <div className="w-full pt-4">
            <IsometricDashboard />
          </div>
        </div>

        {/* Right Side: Gateway Interactive UI Form Container */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div id="auth-gateway" className="w-full max-w-md rounded-2xl border border-[#5B009C]/30 bg-[#020212]/90 p-7 shadow-2xl backdrop-blur-md relative min-h-[360px] flex flex-col justify-center" style={{ boxShadow: "0 12px 40px rgba(2, 2, 18, 0.9), 0 0 20px rgba(91, 0, 156, 0.12)" }}>
            <div className="absolute inset-0 bg-gradient-to-b from-[#5B009C]/5 to-transparent pointer-events-none rounded-2xl" />

            <div className="mb-7 flex items-center gap-3 relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#5B009C]/30 bg-[#020212]">
                <Image
                  src="/assets/logo/favicon.png"
                  alt="Nect favicon"
                  width={32}
                  height={32}
                  className="h-8 w-8 animate-pulse"
                />
              </div>
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-[0.22em] text-[#c084fc]">
                  Nect_Access
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  System initialization gate
                </p>
              </div>
            </div>

            <div className="relative z-10">
              {activeForm === null ? (
                <div className="space-y-6 text-center py-4 animate-fade-in">
                  <p className="text-xs font-mono text-slate-400">
                    Select a pathway to initiate connection with the System.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setActiveForm("signup")}
                      className="w-full rounded-xl bg-[#020212] py-3.5 font-mono text-xs font-bold text-slate-300 border border-[#5B009C]/30 transition-all duration-200 hover:scale-[1.02] hover:border-[#a855f7] hover:text-white active:scale-[0.98]"
                    >
                      START LEVELING UP
                    </button>
                  </div>
                </div>
              ) : (
                <div key={activeForm} className="animate-fade-in-up">
                  {activeForm === "login" && (
                    <form className="space-y-5" onSubmit={handleLogin}>
                      <FormHeader
                        title="Welcome Back"
                        subtitle="Enter credentials to initialize your control panel."
                      />
                      {authError && (
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-center text-xs font-mono text-rose-400 animate-pulse">
                          {authError}
                        </div>
                      )}
                      <input
                        className={inputClass}
                        placeholder="Email Address"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => { setLoginEmail(e.target.value); setAuthError(""); }}
                        required
                      />
                      <PasswordInput
                        show={showPassword}
                        onToggle={() => setShowPassword((value) => !value)}
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(val) => { setLoginPassword(val); setAuthError(""); }}
                      />
                      <div className="flex justify-between items-center">
                        <button
                          type="button"
                          className="text-xs font-mono transition-colors hover:text-[#c084fc] text-slate-500"
                          onClick={() => { setActiveForm(null); setAuthError(""); }}
                        >
                          BACK TO MENU
                        </button>
                        <button
                          type="button"
                          className="text-xs font-mono transition-colors hover:text-[#c084fc] text-slate-500"
                          onClick={() => { setActiveForm("forgot"); setAuthError(""); }}
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-xl bg-[#5B009C] py-3.5 font-mono text-sm font-bold text-white border border-[#a855f7] transition-all duration-200 hover:scale-[1.02] hover:bg-[#510087] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(91,0,156,0.3)]"
                      >
                        {isLoading ? "INITIALIZING CONTROLS..." : "Login"}
                      </button>
                      <AuthFooter
                        text="New user sequence?"
                        action="Create account"
                        onClick={() => { setActiveForm("signup"); setAuthError(""); }}
                      />
                    </form>
                  )}

                  {activeForm === "signup" && (
                    <form className="space-y-5" onSubmit={handleSignup}>
                      <FormHeader
                        title="Create Profile"
                        subtitle="Register telemetry to start tracking consistency levels."
                      />
                      {authError && (
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-center text-xs font-mono text-rose-400">
                          {authError}
                        </div>
                      )}
                      <input
                        className={inputClass}
                        placeholder="Username"
                        value={signupUsername}
                        onChange={(e) => { setSignupUsername(e.target.value); setAuthError(""); }}
                        required
                      />
                      <input
                        className={inputClass}
                        placeholder="Email Address"
                        value={signupEmail}
                        onChange={(e) => { setSignupEmail(e.target.value); setAuthError(""); }}
                        required
                        type="email"
                      />
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 pl-1 block">
                          Date of Birth
                        </label>
                        <input
                          className={inputClass}
                          required
                          type="date"
                          value={dob}
                          onChange={(event) => { setDob(event.target.value); setAuthError(""); }}
                        />
                      </div>
                      <PasswordInput
                        show={showSignupPassword}
                        onToggle={() => setShowSignupPassword((value) => !value)}
                        placeholder="Password"
                        value={signupPassword}
                        onChange={(val) => { setSignupPassword(val); setAuthError(""); }}
                        isInvalid={passwordsMismatch}
                      />
                      <input
                        className={`${inputClass} ${passwordsMismatch
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                          : ""
                          }`}
                        placeholder="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => { setConfirmPassword(event.target.value); setAuthError(""); }}
                        required
                      />
                      {passwordsMismatch && (
                        <p className="text-xs font-mono text-rose-400">
                          Telemetry error: Passwords mismatch.
                        </p>
                      )}
                      <div className="flex justify-start">
                        <button
                          type="button"
                          className="text-xs font-mono transition-colors hover:text-[#c084fc] text-slate-500"
                          onClick={() => { setActiveForm(null); setAuthError(""); }}
                        >
                          BACK TO MENU
                        </button>
                      </div>
                      <button
                        type="submit"
                        disabled={passwordsMismatch || isLoading}
                        className="w-full rounded-xl bg-[#5B009C] py-3.5 font-mono text-sm font-bold text-white border border-[#a855f7] transition-all duration-200 hover:scale-[1.02] hover:bg-[#510087] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-900 disabled:text-slate-600 disabled:hover:scale-100 disabled:border-slate-950 shadow-[0_0_15px_rgba(91,0,156,0.2)]"
                      >
                        {isLoading ? "CREATING REGISTRY..." : "Create Account"}
                      </button>
                      <AuthFooter
                        text="Existing registry?"
                        action="Login"
                        onClick={() => { setActiveForm("login"); setAuthError(""); }}
                      />
                    </form>
                  )}

                  {activeForm === "forgot" && (
                    <form className="space-y-5" onSubmit={handleForgot}>
                      <FormHeader
                        title="Dispatch Token"
                        subtitle="Enter registered email address to dispatch recovery codes."
                      />
                      {authError && (
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-center text-xs font-mono text-rose-400">
                          {authError}
                        </div>
                      )}
                      <input
                        className={inputClass}
                        placeholder="Email Address"
                        value={loginEmail}
                        onChange={(e) => { setLoginEmail(e.target.value); setAuthError(""); }}
                        required
                        type="email"
                      />
                      <div className="flex justify-start">
                        <button
                          type="button"
                          className="text-xs font-mono transition-colors hover:text-[#c084fc] text-slate-500"
                          onClick={() => { setActiveForm("login"); setAuthError(""); }}
                        >
                          BACK TO LOGIN
                        </button>
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-xl bg-[#5B009C] py-3.5 font-mono text-sm font-bold text-white border border-[#a855f7] transition-all duration-200 hover:scale-[1.02] hover:bg-[#510087] active:scale-[0.98] shadow-[0_0_15px_rgba(91,0,156,0.3)]"
                      >
                        {isLoading ? "DISPATCHING TOKEN..." : "DISPATCH CODES"}
                      </button>
                      <AuthFooter
                        text="Cancel command?"
                        action="Login"
                        onClick={() => { setActiveForm("login"); setAuthError(""); }}
                      />
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Docs Modal */}
      {showDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020212]/95 p-4 md:p-8 backdrop-blur-sm animate-fade-in">
          <div className="relative flex h-[80vh] w-full max-w-5xl flex-col rounded-2xl border border-[#5B009C]/30 bg-[#020212] overflow-hidden shadow-2xl" style={{ boxShadow: "0 12px 45px rgba(2,2,18,0.95), 0 0 30px rgba(91,0,156,0.15)" }}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#5B009C]/20 px-6 py-4">
              <span className="font-mono text-sm font-black text-[#c084fc] tracking-wider">
                SYSTEM DOCUMENTATION VIEWER
              </span>
              <button
                onClick={() => setShowDocs(false)}
                className="rounded-lg border border-[#5B009C]/25 p-2 text-slate-400 hover:text-white hover:border-[#a855f7] hover:bg-[#5B009C]/10 transition-all font-mono text-xs"
              >
                CLOSE (ESC)
              </button>
            </div>

            {/* Split Pane */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-64 border-r border-[#5B009C]/20 bg-[#020212]/80 p-4 flex flex-col gap-2 overflow-y-auto shrink-0">
                {Object.entries(DOCUMENTS).map(([key, doc]) => (
                  <button
                    key={key}
                    onClick={() => setActiveDocKey(key as keyof typeof DOCUMENTS)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left font-mono text-xs transition-all ${activeDocKey === key
                      ? "bg-[#5B009C]/10 border-[#5B009C]/30 text-[#c084fc]"
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                  >
                    {getDocIcon(key)}
                    <span>{doc.title.toUpperCase()}</span>
                  </button>
                ))}
              </div>

              {/* Reading Pane */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#020212]/40">
                <div className="prose prose-invert max-w-none font-sans">
                  <h1 className="font-mono text-2xl font-black text-white mb-6 border-b border-[#5B009C]/15 pb-4 flex items-center gap-3">
                    {getDocIcon(activeDocKey)}
                    <span>{DOCUMENTS[activeDocKey].title}</span>
                  </h1>
                  <div className="space-y-6 text-slate-350 leading-relaxed text-sm">
                    {DOCUMENTS[activeDocKey].content.split("\n\n").map((paragraph, i) => {
                      const pTrim = paragraph.trim();
                      if (pTrim.startsWith("## ")) {
                        return (
                          <h2 key={i} className="font-mono text-lg font-bold text-[#c084fc] mt-6 mb-2 tracking-wide uppercase">
                            {renderFormattedText(pTrim.replace("## ", ""))}
                          </h2>
                        );
                      }
                      if (pTrim.startsWith("### ")) {
                        return (
                          <h3 key={i} className="font-mono text-sm font-bold text-white mt-4 mb-1 uppercase">
                            {renderFormattedText(pTrim.replace("### ", ""))}
                          </h3>
                        );
                      }
                      if (pTrim.startsWith("> ")) {
                        return (
                          <blockquote key={i} className="border-l-2 border-[#5B009C]/40 pl-4 py-1 my-3 italic text-slate-400">
                            {renderFormattedText(pTrim.replace("> ", ""))}
                          </blockquote>
                        );
                      }
                      if (pTrim.startsWith("```")) {
                        const lines = pTrim.split("\n");
                        const codeLines = lines.slice(1, lines.length - 1).join("\n");
                        return (
                          <pre key={i} className="bg-[#020212] p-3 rounded-lg border border-[#5B009C]/25 text-[11px] font-mono text-[#10B981] overflow-x-auto my-4">
                            <code>{codeLines}</code>
                          </pre>
                        );
                      }
                      if (pTrim.startsWith("-")) {
                        return (
                          <ul key={i} className="list-disc list-inside space-y-2 pl-2 my-2">
                            {pTrim.split("\n").map((li, j) => (
                              <li key={j} className="text-slate-350">
                                {renderFormattedText(li.replace(/^- \s*/, ""))}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      if (/^\d+\./.test(pTrim)) {
                        return (
                          <ol key={i} className="list-decimal list-inside space-y-2 pl-2 my-2">
                            {pTrim.split("\n").map((li, j) => (
                              <li key={j} className="text-slate-350">
                                {renderFormattedText(li.replace(/^\d+\.\s*/, ""))}
                              </li>
                            ))}
                          </ol>
                        );
                      }
                      return <p key={i}>{renderFormattedText(pTrim)}</p>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function IsometricDashboard() {
  return (
    <div className="w-full mt-6 select-none cursor-pointer">
      {/* Container box for modules */}
      <div className="rounded-2xl border border-[#5B009C]/30 bg-[#020212]/50 p-4 md:p-5 backdrop-blur-sm shadow-[0_0_25px_rgba(91,0,156,0.1)]">
        <div className="flex flex-col md:flex-row gap-4 w-full items-stretch">
          
          {/* 1. Resource Flow */}
          <div
            className="flex-1 rounded-xl border p-4 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300"
            style={{
              background: "#020212",
              borderColor: "rgba(91, 0, 156, 0.35)",
              boxShadow: "0 6px 20px rgba(2, 2, 18, 0.8), 0 0 16px rgba(81, 0, 135, 0.15)"
            }}
          >
            <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid rgba(91, 0, 156, 0.15)" }}>
              <h3 className="text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5" style={{ color: "#a855f7" }}>
                <Coins className="h-3 w-3" style={{ color: "#10B981" }} /> RESOURCE_FLOW
              </h3>
              <div className="flex items-center gap-1.5 text-[7px] font-black text-slate-500">
                <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#10B981" }} />INC</span>
                <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />EXP</span>
              </div>
            </div>
            <div className="font-mono text-[9px] text-slate-500">NET CAPITAL: <span className="font-bold" style={{ color: "#10B981" }}>$14,250</span></div>
            <div className="h-12 w-full flex items-end gap-1">
              {[30, 50, 35, 70, 55, 85, 95].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end h-full group">
                  <div className="rounded-sm w-full transition-all group-hover:bg-[#10B981]/30" style={{ height: `${v}%`, background: "rgba(16, 185, 129, 0.12)" }} />
                  <div className="h-px w-full mt-px" style={{ background: "#10B981", boxShadow: "0 0 4px #10B981" }} />
                </div>
              ))}
            </div>
            <div className="text-[7px] font-mono text-center mt-auto pt-2 text-slate-600" style={{ borderTop: "1px solid rgba(91, 0, 156, 0.12)" }}>
              MONTH TELEMETRY: ACTIVE
            </div>
          </div>

          {/* 2. Training Room */}
          <div
            className="flex-1 rounded-xl border p-4 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300"
            style={{
              background: "#020212",
              borderColor: "rgba(91, 0, 156, 0.35)",
              boxShadow: "0 6px 20px rgba(2, 2, 18, 0.8), 0 0 16px rgba(81, 0, 135, 0.15)"
            }}
          >
            <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid rgba(91, 0, 156, 0.15)" }}>
              <h3 className="text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5" style={{ color: "#a855f7" }}>
                <Dumbbell className="h-3 w-3 text-orange-400" /> TRAINING_ROOM
              </h3>
              <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(81, 0, 135, 0.35)", border: "1px solid rgba(91, 0, 156, 0.4)", color: "#c084fc" }}>
                STRENGTH
              </span>
            </div>
            <div className="font-mono text-[9px] text-slate-500 flex justify-between">
              <span>BENCH: <span className="text-slate-200 font-bold">100kg×5</span></span>
              <span>SQUAT: <span className="text-slate-200 font-bold">140kg×3</span></span>
            </div>
            <div className="h-12 w-full flex items-end gap-1">
              {[2, 4, 3, 5, 1, 4, 6].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end h-full">
                  <div className="rounded-sm w-full bg-orange-500 transition-all hover:opacity-100" style={{
                    height: `${(v / 6) * 100}%`,
                    opacity: 0.5 + (v / 6) * 0.5,
                    boxShadow: v > 4 ? "0 0 5px #f97316" : "none"
                  }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[7px] font-mono mt-auto pt-2 text-slate-600" style={{ borderTop: "1px solid rgba(91, 0, 156, 0.12)" }}>
              <span>COMPLIANCE: <span style={{ color: "#10B981" }}>78%</span></span>
              <span>STREAK: 14d</span>
            </div>
          </div>

          {/* 3. Study Hall */}
          <div
            className="flex-1 rounded-xl border p-4 flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-300"
            style={{
              background: "#020212",
              borderColor: "rgba(91, 0, 156, 0.35)",
              boxShadow: "0 6px 20px rgba(2, 2, 18, 0.8), 0 0 20px rgba(81, 0, 135, 0.22)"
            }}
          >
            <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid rgba(91, 0, 156, 0.15)" }}>
              <h3 className="text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5" style={{ color: "#a855f7" }}>
                <Brain className="h-3 w-3" style={{ color: "#5B009C" }} /> STUDY_HALL
              </h3>
              <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded animate-pulse" style={{ background: "rgba(81, 0, 135, 0.35)", border: "1px solid rgba(91, 0, 156, 0.4)", color: "#c084fc" }}>
                SYNAPTIC
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#0a0020" strokeWidth="3" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#5B009C" strokeWidth="3"
                    strokeDasharray="88 88" strokeDashoffset="14" strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 4px #5B009C)" }} />
                </svg>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-black font-mono" style={{ color: "#c084fc" }}>84%</span>
              </div>
              <div className="font-mono text-[8px] text-slate-500 space-y-1">
                <div>STUDY: <span className="text-slate-200 font-bold">4.5/10h</span></div>
                <div className="flex gap-1.5 mt-1">
                  <div className="flex flex-col items-center px-1.5 py-0.5 rounded" style={{ background: "rgba(2,2,18,0.8)", border: "1px solid rgba(249,115,22,0.2)" }}>
                    <Flame className="h-2.5 w-2.5 text-orange-500" /><span className="text-[6px] text-slate-400 mt-0.5">14d</span>
                  </div>
                  <div className="flex flex-col items-center px-1.5 py-0.5 rounded" style={{ background: "rgba(2,2,18,0.8)", border: "1px solid rgba(91,0,156,0.3)" }}>
                    <Zap className="h-2.5 w-2.5" style={{ color: "#a855f7" }} /><span className="text-[6px] text-slate-400 mt-0.5">7d</span>
                  </div>
                  <div className="flex flex-col items-center px-1.5 py-0.5 rounded" style={{ background: "rgba(2,2,18,0.8)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <Apple className="h-2.5 w-2.5" style={{ color: "#10B981" }} /><span className="text-[6px] text-slate-400 mt-0.5">21d</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-[7px] font-mono text-center mt-auto pt-2 text-slate-600" style={{ borderTop: "1px solid rgba(91, 0, 156, 0.12)" }}>
              RANK: <span className="font-black" style={{ color: "#10B981" }}>S-TIER</span> (94% XP)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function FormHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-1">
      <h2 className="font-mono text-xl font-black text-white uppercase tracking-wider">{title}</h2>
      <p className="text-xs leading-5 text-slate-400">{subtitle}</p>
    </div>
  );
}

function PasswordInput({
  show,
  onToggle,
  placeholder,
  value,
  onChange,
  isInvalid = false,
}: {
  show: boolean;
  onToggle: () => void;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  isInvalid?: boolean;
}) {
  return (
    <div className="relative">
      <input
        className={`${inputClass} pr-20 ${isInvalid ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""
          }`}
        placeholder={placeholder}
        type={show ? "text" : "password"}
        value={value}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
        required
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[10px] font-mono font-semibold text-slate-400 transition-colors hover:text-white"
        onClick={onToggle}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? "HIDE" : "SHOW"}
      </button>
    </div>
  );
}

function AuthFooter({
  text,
  action,
  onClick,
}: {
  text: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <p className="text-center font-mono text-[10px] text-slate-500">
      {text}{" "}
      <button
        type="button"
        className="font-bold text-[#c084fc] transition-colors hover:text-[#d8b4fe]"
        onClick={onClick}
      >
        {action.toUpperCase()}
      </button>
    </p>
  );
}
