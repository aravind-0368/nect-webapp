"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import {
  Settings,
  LayoutDashboard,
  Dumbbell,
  Utensils,
  BookOpen,
  DollarSign,
  ListTodo
} from "lucide-react";
import { ExerciseModule } from "./ExerciseModule";
import { FoodModule } from "./FoodModule";
import { LearningModule } from "./LearningModule";
import { MoneyModule } from "./MoneyModule";
import { TaskModule } from "./TaskModule";
import { DashboardModule } from "./DashboardModule";
import { ControlPanelDrawer } from "./ControlPanelDrawer";
import { RankUpOverlay } from "./RankUpOverlay";
import { useNectStore, getActiveRank, rankTiers, ModuleKey } from "../store/useNectStore";

const moduleIcons: Record<ModuleKey, React.ComponentType<{ className?: string }>> = {
  Dashboard: LayoutDashboard,
  Workout: Dumbbell,
  Food: Utensils,
  Learning: BookOpen,
  Money: DollarSign,
  Tasks: ListTodo,
};

type AppShellProps = {
  onLogout: () => void;
};

const initialModules: ModuleKey[] = [
  "Dashboard",
  "Workout",
  "Food",
  "Learning",
  "Money",
  "Tasks",
];

export function AppShell({ onLogout }: AppShellProps) {
  const [activeModule, setActiveModule] = useState<ModuleKey>("Dashboard");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Zustand State
  const {
    points,
    lockRankTheme,
    rankOverride,
    autoApproveTransactions,
    visibleModules
  } = useNectStore();

  // Lifted state from ExerciseModule for sharing with FoodModule
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(180);

  const accentColor = useMemo(() => {
    if (lockRankTheme) {
      return getActiveRank(points).color;
    }
    return rankTiers.find((rank) => rank.name === rankOverride)?.color ?? "#00FFFF";
  }, [lockRankTheme, rankOverride, points]);

  const enabledModules = initialModules.filter((module) => visibleModules[module]);

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

      {/* Persistent top-navigation header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
          
          {/* Logo container with Rank-Reactive Aura */}
          <button
            type="button"
            className="flex items-center justify-center rounded-2xl border bg-slate-900/60 p-2.5 active:scale-95 transition-all duration-300"
            style={{
              borderColor: "var(--rank-accent)",
              boxShadow: "0 0 16px var(--rank-accent), inset 0 0 10px var(--rank-accent)"
            }}
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

          {/* Navigation Shell */}
          <nav className="flex flex-1 flex-wrap justify-center gap-2">
            {enabledModules.map((module) => {
              const Icon = moduleIcons[module];
              return (
                <button
                  key={module}
                  type="button"
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                    activeModule === module
                      ? "border-[var(--rank-accent)] bg-[var(--rank-accent)]/15 text-white shadow-[0_0_24px_rgba(34,211,238,0.18)]"
                      : "border-slate-800 bg-slate-900/55 text-slate-300 hover:border-slate-600 hover:text-white"
                  }`}
                  onClick={() => {
                    setSettingsOpen(false);
                    setActiveModule(module);
                  }}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{module}</span>
                </button>
              );
            })}
          </nav>

          {/* Top-Right Action Anchor: Settings Gear Icon */}
          <button
            type="button"
            className={`rounded-xl border p-3 transition-all duration-200 active:scale-95 cursor-pointer ${
              settingsOpen
                ? "border-[var(--rank-accent)] bg-[var(--rank-accent)]/15 text-white"
                : "border-slate-800 bg-slate-900/55 text-slate-400 hover:border-slate-650 hover:text-white"
            }`}
            onClick={() => setSettingsOpen((val) => !val)}
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <ModuleWorkspace
          activeModule={activeModule}
          accentColor={accentColor}
          weight={weight}
          setWeight={setWeight}
          height={height}
          setHeight={setHeight}
        />
      </div>

      {/* Control Panel Drawer Sidebar */}
      <ControlPanelDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onLogout={onLogout}
      />

      {/* Rank Up Overlay Level-Up Interceptor */}
      <RankUpOverlay />
    </main>
  );
}

function ModuleWorkspace({
  activeModule,
  accentColor,
  weight,
  setWeight,
  height,
  setHeight,
}: {
  activeModule: ModuleKey;
  accentColor: string;
  weight: number;
  setWeight: (w: number) => void;
  height: number;
  setHeight: (h: number) => void;
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
      />
    );
  }

  if (activeModule === "Learning") {
    return <LearningModule />;
  }

  if (activeModule === "Money") {
    return <MoneyModule />;
  }

  if (activeModule === "Tasks") {
    return <TaskModule />;
  }

  return (
    <DashboardModule
      points={useNectStore.getState().points}
      accentColor={accentColor}
      weight={weight}
      height={height}
    />
  );
}
