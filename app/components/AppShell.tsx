"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useMemo, useState, useEffect } from "react";
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

function calculateAge(dobString: string): number {
  if (!dobString) return 25;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return 25;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

const initialModules: ModuleKey[] = [
  "Dashboard",
  "Workout",
  "Food",
  "Learning",
  "Money",
  "Tasks",
];

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "255, 255, 255";
}

export function AppShell({ onLogout }: AppShellProps) {
  const [activeModule, setActiveModule] = useState<ModuleKey>("Dashboard");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Zustand State
  const {
    points,
    lockRankTheme,
    rankOverride,
    autoApproveTransactions,
    visibleModules,
    userId,
  } = useNectStore();

  const getWeightKey = () => userId ? `nect_telemetry_weight_${userId}` : "nect_telemetry_weight";
  const getHeightKey = () => userId ? `nect_telemetry_height_${userId}` : "nect_telemetry_height";
  const getDobKey = () => userId ? `nect_telemetry_dob_${userId}` : "nect_telemetry_dob";
  const getAgeKey = () => userId ? `nect_telemetry_age_${userId}` : "nect_telemetry_age";
  const getSexKey = () => userId ? `nect_telemetry_sex_${userId}` : "nect_telemetry_sex";
  const getActivityKey = () => userId ? `nect_telemetry_activity_${userId}` : "nect_telemetry_activity";
  const getProteinKey = () => userId ? `nect_telemetry_protein_factor_${userId}` : "nect_telemetry_protein_factor";

  // Lifted states for sharing across modules
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(180);
  const [dob, setDob] = useState("");
  const [age, setAge] = useState(25);
  const [biologicalSex, setBiologicalSex] = useState<"Men" | "Women">("Men");
  const [activityMultiplier, setActivityMultiplier] = useState<"Sedentary" | "Lightly Active" | "Moderately Active" | "Very Active">("Moderately Active");
  const [proteinActivityFactor, setProteinActivityFactor] = useState<"Sedentary" | "Active" | "Strength">("Strength");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWeight = localStorage.getItem(getWeightKey());
      if (savedWeight) setWeight(Number(savedWeight));

      const savedHeight = localStorage.getItem(getHeightKey());
      if (savedHeight) setHeight(Number(savedHeight));

      const savedDob = localStorage.getItem(getDobKey());
      if (savedDob) {
        setDob(savedDob);
        setAge(calculateAge(savedDob));
      } else {
        const savedAge = localStorage.getItem(getAgeKey());
        if (savedAge) setAge(Number(savedAge));
      }

      const savedSex = localStorage.getItem(getSexKey());
      if (savedSex) setBiologicalSex(savedSex as "Men" | "Women");

      const savedActivity = localStorage.getItem(getActivityKey());
      if (savedActivity) setActivityMultiplier(savedActivity as any);

      const savedProtein = localStorage.getItem(getProteinKey());
      if (savedProtein) setProteinActivityFactor(savedProtein as any);

      setIsLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    if (!isLoaded) return;
    if (typeof window !== "undefined") {
      localStorage.setItem(getDobKey(), dob);
    }
    if (dob) {
      const calculated = calculateAge(dob);
      setAge(calculated);
    }
  }, [dob, isLoaded]);

  useEffect(() => {
    if (!dob || !isLoaded) return;
    const interval = setInterval(() => {
      const currentAge = calculateAge(dob);
      if (currentAge !== age) {
        setAge(currentAge);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [dob, age, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(getWeightKey(), String(weight));
  }, [weight, isLoaded]);
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(getHeightKey(), String(height));
  }, [height, isLoaded]);
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(getAgeKey(), String(age));
  }, [age, isLoaded]);
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(getSexKey(), biologicalSex);
  }, [biologicalSex, isLoaded]);
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(getActivityKey(), activityMultiplier);
  }, [activityMultiplier, isLoaded]);
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(getProteinKey(), proteinActivityFactor);
  }, [proteinActivityFactor, isLoaded]);

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
      style={{
        "--rank-accent": accentColor,
        "--rank-accent-rgb": hexToRgb(accentColor),
        "--rank-accent-glow": `0 0 24px ${accentColor}2d`,
        "--rank-accent-glow-strong": `0 0 24px ${accentColor}40`,
        "--rank-accent-glow-subtle": `0 0 28px ${accentColor}1a`,
      } as CSSProperties}
    >
      <div className="fixed inset-0 -z-10">
        <div className="absolute left-10 top-24 h-80 w-80 rounded-full bg-purple-700/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-emerald-700/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--rank-accent)]/10 blur-3xl" />
      </div>

      {/* Persistent top-navigation header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
          
          
            <Image
              src="/assets/logo/nect-logo.png"
              alt="Nect logo"
              width={162}
              height={68}
              className="h-auto w-28 sm:w-32"
              priority
            />
         

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
                      ? "border-[var(--rank-accent)] bg-[var(--rank-accent)]/15 text-white shadow-[var(--rank-accent-glow)]"
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
          age={age}
          setAge={setAge}
          dob={dob}
          setDob={setDob}
          biologicalSex={biologicalSex}
          setBiologicalSex={setBiologicalSex}
          activityMultiplier={activityMultiplier}
          setActivityMultiplier={setActivityMultiplier}
          proteinActivityFactor={proteinActivityFactor}
          setProteinActivityFactor={setProteinActivityFactor}
        />
      </div>

      {/* Control Panel Drawer Sidebar */}
      <ControlPanelDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onLogout={onLogout}
        dob={dob}
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
  age,
  setAge,
  dob,
  setDob,
  biologicalSex,
  setBiologicalSex,
  activityMultiplier,
  setActivityMultiplier,
  proteinActivityFactor,
  setProteinActivityFactor,
}: {
  activeModule: ModuleKey;
  accentColor: string;
  weight: number;
  setWeight: (w: number) => void;
  height: number;
  setHeight: (h: number) => void;
  age: number;
  setAge: (a: number) => void;
  dob: string;
  setDob: (d: string) => void;
  biologicalSex: "Men" | "Women";
  setBiologicalSex: (s: "Men" | "Women") => void;
  activityMultiplier: "Sedentary" | "Lightly Active" | "Moderately Active" | "Very Active";
  setActivityMultiplier: (m: "Sedentary" | "Lightly Active" | "Moderately Active" | "Very Active") => void;
  proteinActivityFactor: "Sedentary" | "Active" | "Strength";
  setProteinActivityFactor: (f: "Sedentary" | "Active" | "Strength") => void;
}) {
  const points = useNectStore((state) => state.points);

  if (activeModule === "Workout") {
    return (
      <ExerciseModule
        weight={weight}
        setWeight={setWeight}
        height={height}
        setHeight={setHeight}
        age={age}
        setAge={setAge}
        dob={dob}
        setDob={setDob}
        biologicalSex={biologicalSex}
        setBiologicalSex={setBiologicalSex}
        activityMultiplier={activityMultiplier}
        setActivityMultiplier={setActivityMultiplier}
        proteinActivityFactor={proteinActivityFactor}
        setProteinActivityFactor={setProteinActivityFactor}
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
        age={age}
        setAge={setAge}
        biologicalSex={biologicalSex}
        setBiologicalSex={setBiologicalSex}
        activityMultiplier={activityMultiplier}
        setActivityMultiplier={setActivityMultiplier}
        proteinActivityFactor={proteinActivityFactor}
        setProteinActivityFactor={setProteinActivityFactor}
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
      points={points}
      accentColor={accentColor}
      weight={weight}
      height={height}
      age={age}
      biologicalSex={biologicalSex}
      activityMultiplier={activityMultiplier}
      proteinActivityFactor={proteinActivityFactor}
    />
  );
}
