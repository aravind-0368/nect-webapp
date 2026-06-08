"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { FormEvent, useMemo, useState } from "react";
import { ExerciseModule } from "./ExerciseModule";
import { FoodModule } from "./FoodModule";
import { LearningModule } from "./LearningModule";
import { MoneyModule } from "./MoneyModule";
import { TaskModule } from "./TaskModule";
import { DashboardModule } from "./DashboardModule";

type AppShellProps = {
  onLogout: () => void;
};

type ModuleKey = "Dashboard" | "Workout" | "Food" | "Learning" | "Money" | "Tasks";
type SettingsTab = "profile" | "settings";

const activeRankHex = "#00FFFF";
const legacyRanks = [
  { name: "Outcast", color: "#555555" },
  { name: "Vanguard", color: "#990000" },
  { name: "Sorcerer", color: "#00008B" },
  { name: "Archon", color: "#00FFFF" },
  { name: "Dread-General", color: "#74888C" },
  { name: "High-Lord", color: "#6A0DAD" },
  { name: "Overlord", color: "#FFD700" },
  { name: "Monarch", color: "#4B0082" },
  { name: "Demiurge", color: "#E5E4E2" },
];

const initialModules: ModuleKey[] = [
  "Dashboard",
  "Workout",
  "Food",
  "Learning",
  "Money",
  "Tasks",
];

const dashboardWidgets = [
  "Workout Consistency Radial Chart",
  "Weekly Task Execution Bar Chart",
  "Fuel Target Progress Gauges",
  "Category Expense Pie Chart",
  "Net Worth Area Spline",
  "Academic Trajectory Line Chart",
];

export function AppShell({ onLogout }: AppShellProps) {
  const [activeModule, setActiveModule] = useState<ModuleKey>("Dashboard");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("profile");
  const [visibleModules, setVisibleModules] = useState<Record<ModuleKey, boolean>>({
    Dashboard: true,
    Workout: true,
    Food: true,
    Learning: true,
    Money: true,
    Tasks: true,
  });
  const [lockRankTheme, setLockRankTheme] = useState(true);
  const [rankOverride, setRankOverride] = useState(legacyRanks[2].name);
  const [autoApproveTransactions, setAutoApproveTransactions] = useState(true);

  // Lifted state from ExerciseModule for sharing with FoodModule
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(180);
  const [points, setPoints] = useState(12840);

  const accentColor = useMemo(() => {
    if (lockRankTheme) {
      if (points >= 100000) return "#E5E4E2"; // Demiurge
      if (points >= 60000) return "#4B0082";  // Monarch
      if (points >= 30000) return "#FFD700";  // Overlord
      if (points >= 15000) return "#6A0DAD";  // High-Lord
      if (points >= 7500) return "#74888C";   // Dread-General
      if (points >= 3500) return "#00FFFF";   // Archon
      if (points >= 1500) return "#00008B";   // Sorcerer
      if (points >= 500) return "#990000";    // Vanguard
      return "#555555";                       // Outcast
    }

    return legacyRanks.find((rank) => rank.name === rankOverride)?.color ?? activeRankHex;
  }, [lockRankTheme, rankOverride, points]);

  const enabledModules = initialModules.filter((module) => visibleModules[module]);
  const showSettings = settingsOpen;

  function toggleModule(module: ModuleKey) {
    if (module === "Dashboard") {
      return;
    }

    if (module === "Workout" && visibleModules.Workout) {
      alert(
        "Warning: Disabling the Workout module will interrupt automated metric handshakes. The Food module's target calculations will switch to static defaults.",
      );
    }

    setVisibleModules((current) => {
      const next = { ...current, [module]: !current[module] };

      if (!next[activeModule]) {
        setActiveModule("Dashboard");
      }

      return next;
    });
  }

  return (
    <main
      className="min-h-screen bg-[#070814] text-slate-100"
      style={{ "--rank-accent": accentColor } as CSSProperties}
    >
      <div className="fixed inset-0 -z-10">
        <div className="absolute left-10 top-24 h-80 w-80 rounded-full bg-purple-700/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-emerald-700/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--rank-accent)]/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            className="flex items-center gap-3 active:scale-95 transition-transform duration-100"
            onClick={() => {
              setSettingsOpen(false);
              setActiveModule("Dashboard");
            }}
            aria-label="Open dashboard"
          >
            <Image
              src="/assets/logo/nect-logo.png"
              alt="Nect logo"
              width={142}
              height={48}
              className="h-auto w-28 sm:w-32"
              priority
            />
          </button>

          <nav className="flex flex-1 flex-wrap justify-center gap-2">
            {enabledModules.map((module) => (
              <button
                key={module}
                type="button"
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  !showSettings && activeModule === module
                    ? "border-[var(--rank-accent)] bg-[var(--rank-accent)]/15 text-white shadow-[0_0_24px_rgba(34,211,238,0.18)]"
                    : "border-slate-800 bg-slate-900/55 text-slate-300 hover:border-slate-600 hover:text-white"
                }`}
                onClick={() => {
                  setSettingsOpen(false);
                  setActiveModule(module);
                }}
              >
                {module}
              </button>
            ))}
          </nav>

          <button
            type="button"
            className={`rounded-xl border px-4 py-2 text-sm font-bold transition-all duration-200 active:scale-95 ${
              showSettings
                ? "border-[var(--rank-accent)] bg-[var(--rank-accent)]/15 text-white"
                : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
            }`}
            onClick={() => setSettingsOpen((value) => !value)}
          >
            Settings
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {showSettings ? (
          <SettingsWorkspace
            accentColor={accentColor}
            activeTab={settingsTab}
            autoApproveTransactions={autoApproveTransactions}
            lockRankTheme={lockRankTheme}
            onDeleteAccount={() => {
              const confirmation = prompt("Type DELETE to erase local prototype data.");
              if (confirmation === "DELETE") {
                localStorage.clear();
                alert("Local prototype data cleared.");
                onLogout();
              }
            }}
            onLogout={onLogout}
            onSetActiveTab={setSettingsTab}
            onSetAutoApproveTransactions={setAutoApproveTransactions}
            onSetLockRankTheme={setLockRankTheme}
            onSetRankOverride={setRankOverride}
            onToggleModule={toggleModule}
            rankOverride={rankOverride}
            visibleModules={visibleModules}
            points={points}
          />
        ) : (
          <ModuleWorkspace
            activeModule={activeModule}
            accentColor={accentColor}
            visibleModules={visibleModules}
            weight={weight}
            setWeight={setWeight}
            height={height}
            setHeight={setHeight}
            onAwardPoints={(amount) => setPoints((curr) => curr + amount)}
            autoApproveTransactions={autoApproveTransactions}
            points={points}
          />
        )}
      </div>
    </main>
  );
}

function ModuleWorkspace({
  activeModule,
  accentColor,
  visibleModules,
  weight,
  setWeight,
  height,
  setHeight,
  onAwardPoints,
  autoApproveTransactions,
  points,
}: {
  activeModule: ModuleKey;
  accentColor: string;
  visibleModules: Record<ModuleKey, boolean>;
  weight: number;
  setWeight: (w: number) => void;
  height: number;
  setHeight: (h: number) => void;
  onAwardPoints: (amount: number) => void;
  autoApproveTransactions: boolean;
  points: number;
}) {
  if (activeModule === "Workout") {
    return (
      <ExerciseModule
        weight={weight}
        setWeight={setWeight}
        height={height}
        setHeight={setHeight}
      />
    );
  }

  if (activeModule === "Food") {
    return (
      <FoodModule
        weight={weight}
        setWeight={setWeight}
        height={height}
        setHeight={setHeight}
        workoutEnabled={visibleModules.Workout}
      />
    );
  }

  if (activeModule === "Learning") {
    return <LearningModule onAwardPoints={onAwardPoints} />;
  }

  if (activeModule === "Money") {
    return <MoneyModule autoApproveTransactions={autoApproveTransactions} />;
  }

  if (activeModule === "Tasks") {
    return <TaskModule onAwardPoints={onAwardPoints} />;
  }

  return (
    <DashboardModule
      points={points}
      accentColor={accentColor}
      visibleModules={visibleModules}
    />
  );
}

function SettingsWorkspace({
  accentColor,
  activeTab,
  autoApproveTransactions,
  lockRankTheme,
  onDeleteAccount,
  onLogout,
  onSetActiveTab,
  onSetAutoApproveTransactions,
  onSetLockRankTheme,
  onSetRankOverride,
  onToggleModule,
  rankOverride,
  visibleModules,
  points,
}: {
  accentColor: string;
  activeTab: SettingsTab;
  autoApproveTransactions: boolean;
  lockRankTheme: boolean;
  onDeleteAccount: () => void;
  onLogout: () => void;
  onSetActiveTab: (tab: SettingsTab) => void;
  onSetAutoApproveTransactions: (value: boolean) => void;
  onSetLockRankTheme: (value: boolean) => void;
  onSetRankOverride: (value: string) => void;
  onToggleModule: (module: ModuleKey) => void;
  rankOverride: string;
  visibleModules: Record<ModuleKey, boolean>;
  points: number;
}) {
  return (
    <section className="grid min-h-[600px] gap-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-sm md:grid-cols-[230px_1fr] md:p-6">
      <aside className="flex rounded-2xl border border-slate-800 bg-slate-950/45 p-3 md:flex-col">
        {[
          { id: "profile" as const, label: "Profile" },
          { id: "settings" as const, label: "Settings" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`w-full rounded-xl px-4 py-3 text-left text-sm font-bold transition-all duration-100 active:scale-95 ${
              activeTab === tab.id
                ? "bg-[var(--rank-accent)]/15 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
            onClick={() => onSetActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </aside>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5">
        {activeTab === "profile" ? (
          <ProfilePanel accentColor={accentColor} onLogout={onLogout} points={points} />
        ) : (
          <SettingsPanel
            autoApproveTransactions={autoApproveTransactions}
            lockRankTheme={lockRankTheme}
            onDeleteAccount={onDeleteAccount}
            onSetAutoApproveTransactions={onSetAutoApproveTransactions}
            onSetLockRankTheme={onSetLockRankTheme}
            onSetRankOverride={onSetRankOverride}
            onToggleModule={onToggleModule}
            rankOverride={rankOverride}
            visibleModules={visibleModules}
          />
        )}
      </div>
    </section>
  );
}

function ProfilePanel({
  accentColor,
  onLogout,
  points,
}: {
  accentColor: string;
  onLogout: () => void;
  points: number;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [password, setPassword] = useState("nect-rank-1240");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setPassword(newPassword);
    setNewPassword("");
    setConfirmPassword("");
    setChangingPassword(false);
    alert("Password updated locally.");
  }

  return (
    <div className="flex min-h-[540px] flex-col">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Cosmic Identity
        </p>
        <h2 className="mt-3 text-3xl font-black text-white">Aravind</h2>
        <p className="mt-2 text-slate-400">aravind@nect.local</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Stat label="Rank Title" value="Archon" accentColor={accentColor} />
          <Stat label="Total Points" value={points.toLocaleString()} accentColor={accentColor} />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/35 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">Password</p>
            <p className="mt-1 font-mono text-sm text-slate-400">
              {showPassword ? password : "************"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-bold text-slate-200 transition-transform duration-100 hover:border-slate-500 active:scale-95"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="rounded-xl border border-[var(--rank-accent)]/40 px-3 py-2 text-sm font-bold text-[var(--rank-accent)] transition-transform duration-100 active:scale-95"
              onClick={() => setChangingPassword((value) => !value)}
            >
              Change Password
            </button>
          </div>
        </div>

        {changingPassword && (
          <form className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={savePassword}>
            <input
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              placeholder="New Password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
            <input
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              placeholder="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-transform duration-100 active:scale-95"
            >
              Save
            </button>
          </form>
        )}
      </div>

      <button
        type="button"
        className="mt-auto w-full rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 font-bold text-rose-200 transition-transform duration-100 hover:bg-rose-500/20 active:scale-95"
        onClick={onLogout}
      >
        Log Out
      </button>
    </div>
  );
}

function SettingsPanel({
  autoApproveTransactions,
  lockRankTheme,
  onDeleteAccount,
  onSetAutoApproveTransactions,
  onSetLockRankTheme,
  onSetRankOverride,
  onToggleModule,
  rankOverride,
  visibleModules,
}: {
  autoApproveTransactions: boolean;
  lockRankTheme: boolean;
  onDeleteAccount: () => void;
  onSetAutoApproveTransactions: (value: boolean) => void;
  onSetLockRankTheme: (value: boolean) => void;
  onSetRankOverride: (value: string) => void;
  onToggleModule: (module: ModuleKey) => void;
  rankOverride: string;
  visibleModules: Record<ModuleKey, boolean>;
}) {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Global Cosmic Theming Interface"
        description="Rank colors drive glows, borders, progress rings, and active controls."
      >
        <ToggleRow
          label="Lock Theme to Active Rank"
          checked={lockRankTheme}
          onChange={onSetLockRankTheme}
        />
        <select
          className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
          disabled={lockRankTheme}
          value={rankOverride}
          onChange={(event) => onSetRankOverride(event.target.value)}
        >
          {legacyRanks.map((rank) => (
            <option key={rank.name} value={rank.name}>
              {rank.name} Theme ({rank.color})
            </option>
          ))}
        </select>
      </SettingsSection>

      <SettingsSection
        title="Dashboard Chart Position Arrangement Grid"
        description="The central cosmic rank engine stays locked. Supporting charts can be staged by priority."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          {dashboardWidgets.map((widget) => (
            <label
              key={widget}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm transition-transform duration-100 active:scale-95"
            >
              <span className="font-semibold text-slate-200">{widget}</span>
              <select className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200">
                {dashboardWidgets.map((_, optionIndex) => (
                  <option key={optionIndex} value={optionIndex + 1}>
                    Position {optionIndex + 1}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Interactive System Visibility Checklist Matrix"
        description="Unchecked modules leave the navigation shell and their dashboard cards are no longer surfaced."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {initialModules.map((module) => (
            <label
              key={module}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm font-semibold text-slate-200 transition-transform duration-100 active:scale-95"
            >
              <input
                type="checkbox"
                checked={visibleModules[module]}
                disabled={module === "Dashboard"}
                onChange={() => onToggleModule(module)}
                className="h-4 w-4 accent-[var(--rank-accent)]"
              />
              Enable {module}
            </label>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Leverage System Automations"
        description="Recurring money items can pause for confirmation or pass directly into the ledger."
      >
        <ToggleRow
          label="Auto-Approve Recurring Transactions"
          checked={autoApproveTransactions}
          onChange={onSetAutoApproveTransactions}
        />
      </SettingsSection>

      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-xl border border-rose-500/50 bg-rose-600/15 px-5 py-3 font-black uppercase tracking-[0.16em] text-rose-200 transition-transform duration-100 hover:bg-rose-600/25 active:scale-95"
          onClick={onDeleteAccount}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/35 p-5">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-left transition-transform duration-100 active:scale-95"
      onClick={() => onChange(!checked)}
    >
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <span
        className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${
          checked ? "bg-[var(--rank-accent)]" : "bg-slate-700"
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

function Stat({
  label,
  value,
  accentColor,
}: {
  label: string;
  value: string;
  accentColor: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/55 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-white" style={{ color: accentColor }}>
        {value}
      </p>
    </div>
  );
}
