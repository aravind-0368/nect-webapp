"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle, AlertCircle, BookOpen, Flame, Zap, Apple,
  Sparkles, Brain, Dumbbell, Utensils, DollarSign, ListTodo,
  Calendar, CheckSquare, Square, RefreshCw, Leaf, BicepsFlexed
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  RadialBarChart,
  RadialBar
} from "recharts";
import { useNectStore, getActiveRank } from "../store/useNectStore";
import { BodyPartVectorMap } from "./BodyPartVectorMap";

type PriorityLevel = "low" | "medium" | "high";

interface Task {
  id: string;
  title: string;
  priority: PriorityLevel;
  completed: boolean;
}

interface Transaction {
  id: string;
  name: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
}

interface Category {
  name: string;
  color: string;
  monthlyLimit: number | null;
}

interface WorkoutItem {
  id: number;
  day: string;
  bodyPart: string;
  name: string;
  reps: number;
  sets: number;
  checkedSets: boolean[];
}

interface StudySession {
  id: number;
  subject: string;
  hours: number;
  minutes: number;
  day: string;
}

interface RevisionSubject {
  id: number;
  name: string;
  checked: boolean;
}

interface ExamRecord {
  id: number;
  title: string;
  isMain: boolean;
  totalMarks: number;
  gainedMarks: number;
  date?: string;
}

interface DashboardModuleProps {
  points: number;
  accentColor: string;
  weight?: number;
  height?: number;
}

export function DashboardModule({ points, accentColor, weight: propWeight, height: propHeight }: DashboardModuleProps) {
  const {
    powerStreak,
    smartStreak,
    healthyStreak,
    visibleModules,
    awardPoints,
    peakMentalPowerUntil
  } = useNectStore();

  const isPeakMentalPowerActive = useMemo(() => {
    return peakMentalPowerUntil ? Date.now() < peakMentalPowerUntil : false;
  }, [peakMentalPowerUntil]);

  const weight = propWeight ?? 75;
  const height = propHeight ?? 180;

  const caloriesTarget = useMemo(() => Math.round(weight * 30), [weight]);
  const proteinTarget = useMemo(() => Math.round(weight * 2.0), [weight]);
  const fiberTarget = useMemo(() => Math.round(height / 7), [height]);

  // --- LOCAL STATES LOADED FROM STORAGE ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [restDays, setRestDays] = useState<Record<string, boolean>>({});
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [revisions, setRevisions] = useState<RevisionSubject[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);

  // Food variables
  const [foodPlate, setFoodPlate] = useState<{
    id: number;
    name: string;
    servingUnit: string;
    quantity: number;
    calories: number;
    protein: number;
    fiber: number;
    checked: boolean;
  }[]>([]);

  const activeRank = useMemo(() => getActiveRank(points), [points]);

  const levelInfo = useMemo(() => {
    const currentLevel = Math.floor(points / 1000) + 1;
    const currentXp = points % 1000;
    const progress = (currentXp / 1000) * 100;
    return { level: currentLevel, xp: currentXp, progress };
  }, [points]);

  // --- LOCAL STORAGE DATA HYDRATION ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const storedTasks = localStorage.getItem("nect_tasks");
      if (storedTasks) setTasks(JSON.parse(storedTasks));

      const storedTx = localStorage.getItem("nect_money_transactions");
      const storedCat = localStorage.getItem("nect_money_categories");
      if (storedTx) setTransactions(JSON.parse(storedTx));
      if (storedCat) setCategories(JSON.parse(storedCat));

      const storedWorkouts = localStorage.getItem("nect_workout_items");
      const storedRest = localStorage.getItem("nect_workout_rest_days");
      if (storedWorkouts) setWorkouts(JSON.parse(storedWorkouts));
      if (storedRest) setRestDays(JSON.parse(storedRest));

      const storedSessions = localStorage.getItem("nect_learning_sessions");
      const storedRevs = localStorage.getItem("nect_learning_revisions");
      const storedExams = localStorage.getItem("nect_learning_exams");
      if (storedSessions) setSessions(JSON.parse(storedSessions));
      if (storedRevs) setRevisions(JSON.parse(storedRevs));
      if (storedExams) setExams(JSON.parse(storedExams));

      const storedPlate = localStorage.getItem("nect_food_plate_items");
      if (storedPlate) setFoodPlate(JSON.parse(storedPlate));
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // --- 5-SECOND SCANNING SEQUENCE ---
  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
  };

  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          setIsScanning(false);
          clearInterval(interval);
          return 100;
        }
        return prev + 2; // Increments by 2 every 100ms -> 50 intervals -> 5 seconds total
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isScanning]);

  // --- MUSCLE GROUP WEEKLY LOG CALCULATION ---
  const muscleGroupsProgress = useMemo(() => {
    const defaultFallbacks = {
      chest: 85,
      legs: 45,
      back: 62,
      arms: 90,
      abs: 20,
      shoulders: 75
    };

    const groups = ["chest", "legs", "back", "arms", "abs", "shoulders"];
    const results: Record<string, number> = {};

    groups.forEach((group) => {
      const related = workouts.filter((w) => {
        const bp = w.bodyPart.toLowerCase();
        if (group === "chest") return bp.includes("chest");
        if (group === "legs") return bp.includes("leg");
        if (group === "back") return bp.includes("back");
        if (group === "shoulders") return bp.includes("shoulder") || bp.includes("shoulders");
        if (group === "arms") return bp.includes("arm") || bp.includes("bicep") || bp.includes("tricep");
        if (group === "abs") return bp.includes("abs") || bp.includes("core");
        return false;
      });

      if (related.length === 0) {
        results[group] = defaultFallbacks[group as keyof typeof defaultFallbacks];
        return;
      }

      let totalSets = 0;
      let completedSets = 0;
      related.forEach((item) => {
        const setsCount = item.sets || 0;
        totalSets += setsCount;
        completedSets += item.checkedSets ? item.checkedSets.filter(Boolean).length : 0;
      });

      results[group] = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
    });

    return results;
  }, [workouts]);

  const completedParts = useMemo(() => {
    const uniqueParts = Array.from(new Set(workouts.map((w) => w.bodyPart)));
    return uniqueParts.filter((part) => {
      const related = workouts.filter((w) => w.bodyPart === part);
      return related.length > 0 && related.every((w) => w.checkedSets && w.checkedSets.every(Boolean));
    });
  }, [workouts]);

  // Dynamic Color helpers
  const getMuscleColor = (pct: number) => {
    if (pct < 50) return { stroke: "#ef4444", fill: "#ef444420", text: "text-red-400" };
    if (pct <= 70) return { stroke: "#f59e0b", fill: "#f59e0b20", text: "text-amber-400" };
    return { stroke: "#10b981", fill: "#10b98120", text: "text-emerald-450" };
  };

  const segmentStroke = (group: string) => {
    if (isScanning) return "#22d3ee";
    if (group === "head") {
      if (isPeakMentalPowerActive) return "#c084fc";
      return hoveredZone === "head" ? "#818cf8" : "#475569";
    }
    if (hoveredZone === group) {
      const pct = muscleGroupsProgress[group];
      return getMuscleColor(pct).stroke;
    }
    return "#475569";
  };

  const segmentFill = (group: string) => {
    if (isScanning) return "#22d3ee08";
    if (group === "head") {
      if (isPeakMentalPowerActive) return "rgba(168, 85, 247, 0.25)";
      return hoveredZone === "head" ? "rgba(129, 140, 248, 0.15)" : "rgba(71, 85, 105, 0.05)";
    }
    if (hoveredZone === group) {
      const pct = muscleGroupsProgress[group];
      return getMuscleColor(pct).fill;
    }
    return "#47556908";
  };

  const [hoveredZone, setHoveredZone] = useState<"chest" | "legs" | "back" | "arms" | "abs" | "head" | "shoulders" | null>(null);

  // --- OTHERS DATA ENGINE ---
  const foodTelemetry = useMemo(() => {
    const plateList = foodPlate.length > 0 ? foodPlate : [
      { calories: 350, protein: 25, fiber: 6, quantity: 1, checked: true }
    ];
    let calories = 0;
    let protein = 0;
    let fiber = 0;
    plateList.forEach(item => {
      if (item.checked) {
        calories += Math.round(item.calories * item.quantity);
        protein += Math.round(item.protein * item.quantity);
        fiber += Math.round(item.fiber * item.quantity);
      }
    });
    return {
      calories,
      targetCal: 2250,
      protein,
      fiber
    };
  }, [foodPlate]);

  // Learning metrics
  const learningTelemetry = useMemo(() => {
    const studyHours = sessions.reduce((sum, s) => sum + (s.hours || 0) + (s.minutes || 0) / 60, 0);
    const hours = studyHours > 0 ? Math.round(studyHours * 10) / 10 : 4.5;
    const target = 10;

    // Nearest active exam
    const todayStr = new Date().toISOString().split("T")[0];
    const activeExams = exams.filter(e => e.date && e.date >= todayStr);
    const closestExam = activeExams.length > 0
      ? [...activeExams].sort((a, b) => a.date!.localeCompare(b.date!))[0]
      : null;

    return { hours, target, closestExam };
  }, [sessions, exams]);

  // Task metrics
  const taskTelemetry = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    return { completed, total };
  }, [tasks]);

  // --- RESOURCE FLOW DATA (Last 7 Days) ---
  const resourceFlowData = useMemo(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const txList = transactions.length > 0 ? transactions : [
      { id: "1", type: "income", amount: 400, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] },
      { id: "2", type: "expense", amount: 120, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] },
      { id: "3", type: "income", amount: 250, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] },
      { id: "4", type: "expense", amount: 90, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] }
    ] as Transaction[];

    return dates.map((dateStr) => {
      const dayTxs = txList.filter(t => t.date === dateStr);
      const income = dayTxs.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTxs.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
      const dateObj = new Date(dateStr + "T00:00:00");
      const label = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });

      return { name: label, income, expense };
    });
  }, [transactions]);

  // Radial Chart Gauge Data for Study progress
  const studyProgressData = useMemo(() => {
    const value = Math.min(100, Math.round((learningTelemetry.hours / learningTelemetry.target) * 100));
    return [{
      name: "Study",
      value: value || 45,
      fill: "var(--rank-accent)"
    }];
  }, [learningTelemetry]);

  // Toggle Dashboard Task Complete status
  const toggleDashboardTask = (taskId: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        if (nextCompleted) {
          awardPoints(50, "Tasks");
        }
        return { ...t, completed: nextCompleted };
      }
      return t;
    });
    setTasks(updatedTasks);
    localStorage.setItem("nect_tasks", JSON.stringify(updatedTasks));
  };

  return (
    <section className="space-y-6 animate-fade-in-up">
      {/* 1. TOP STATUS HEADER (Progress & Streaks) */}
      <div
        className="rounded-2xl border bg-slate-900/40 p-5 backdrop-blur-sm transition-all duration-300 flex flex-wrap gap-5 items-center justify-between"
        style={{ borderColor: `${accentColor}30`, boxShadow: `0 4px 20px ${accentColor}08` }}
      >
        {/* Left Level Badge & Progress Slider */}
        <div className="flex flex-1 min-w-[280px] items-center gap-4">
          <div
            className="h-12 w-12 rounded-xl flex flex-col items-center justify-center border font-black text-white shrink-0 shadow-lg"
            style={{
              backgroundColor: `${accentColor}15`,
              borderColor: accentColor,
              textShadow: `0 0 10px ${accentColor}60`
            }}
          >
            <span className="text-[10px] text-slate-400 font-bold uppercase -mb-0.5">LVL</span>
            <span className="text-lg leading-none">{levelInfo.level}</span>
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="uppercase tracking-wider font-black">{activeRank.name} RECRUIT</span>
              <span className="text-slate-450">{levelInfo.xp} / 1000 XP ({Math.round(levelInfo.progress)}%)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-950/80 overflow-hidden border border-slate-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${levelInfo.progress}%`,
                  backgroundColor: accentColor,
                  boxShadow: `0 0 10px ${accentColor}60`
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Cosmic Streaks Matrix */}
        <div className="flex flex-wrap items-center gap-3">
          {visibleModules.Workout && (
            <div className="flex items-center gap-2 rounded-xl bg-slate-955 border border-slate-850 px-3.5 py-2">
              <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
              <div className="text-left leading-none">
                <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">POWER STREAK</span>
                <span className="text-xs font-black text-slate-200 mt-0.5 block">{powerStreak}d</span>
              </div>
            </div>
          )}
          {visibleModules.Learning && (
            <div className="flex items-center gap-2 rounded-xl bg-slate-955 border border-slate-850 px-3.5 py-2">
              <Zap className="h-4 w-4 text-indigo-400 animate-pulse" />
              <div className="text-left leading-none">
                <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">SMART STREAK</span>
                <span className="text-xs font-black text-slate-200 mt-0.5 block">{smartStreak}d</span>
              </div>
            </div>
          )}
          {visibleModules.Food && (
            <div className="flex items-center gap-2 rounded-xl bg-slate-955 border border-slate-850 px-3.5 py-2">
              <Apple className="h-4 w-4 text-emerald-400 animate-pulse" />
              <div className="text-left leading-none">
                <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">HEALTHY STREAK</span>
                <span className="text-xs font-black text-slate-200 mt-0.5 block">{healthyStreak}d</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 1.5 MACRO FUEL CELL CARDS */}
      {visibleModules.Food && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {/* Calorie Card (Total Energy Pool) */}
          {(() => {
            const isOverloaded = foodTelemetry.calories > caloriesTarget;
            const progressPercent = Math.min(100, Math.round((foodTelemetry.calories / caloriesTarget) * 100));
            return (
              <div
                className={`rounded-2xl border p-5 backdrop-blur-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[155px] ${isOverloaded
                    ? "border-red-500 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.25)] animate-pulse"
                    : "border-amber-500/20 bg-slate-900/40 hover:border-amber-500/45 hover:shadow-[0_0_20px_rgba(245,158,11,0.06)]"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border transition-colors duration-300 ${isOverloaded ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-amber-500/10 border-amber-500/25 text-amber-400"}`}>
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black tracking-widest text-slate-350 uppercase">CALORIES</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Energy Pool</p>
                    </div>
                  </div>
                  {isOverloaded ? (
                    <span className="text-[9px] font-black tracking-widest uppercase bg-red-950/80 border border-red-800 text-red-350 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(239,68,68,0.2)]">
                      ⚡ OVERLOAD
                    </span>
                  ) : (
                    <span className="text-[9px] font-black tracking-widest uppercase bg-amber-950/80 border border-amber-900 text-amber-350 px-2 py-0.5 rounded">
                      STABLE
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-black text-white leading-none font-mono tracking-tight">
                      {foodTelemetry.calories} <span className="text-xs text-slate-500 font-bold uppercase font-sans">kcal</span>
                    </span>
                    <span className="text-xs text-slate-400 font-bold font-mono">
                      / {caloriesTarget} Target
                    </span>
                  </div>

                  {/* Glowing Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-slate-950/80 overflow-hidden border border-slate-850">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: isOverloaded ? "#ef4444" : "#f59e0b",
                        boxShadow: isOverloaded ? "0 0 10px #ef4444" : "0 0 8px #f59e0b"
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Protein Card (Muscle Repair) */}
          {(() => {
            const isGoalMet = foodTelemetry.protein >= proteinTarget;
            const progressPercent = Math.min(100, Math.round((foodTelemetry.protein / proteinTarget) * 100));
            return (
              <div
                className={`rounded-2xl border p-5 backdrop-blur-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[155px] ${isGoalMet
                    ? "border-cyan-400 bg-cyan-950/15 shadow-[0_0_20px_rgba(34,211,238,0.22)]"
                    : "border-cyan-500/20 bg-slate-900/40 hover:border-cyan-500/45 hover:shadow-[0_0_20px_rgba(34,211,238,0.06)]"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border transition-colors duration-300 ${isGoalMet ? "bg-cyan-500/10 border-cyan-400/35 text-cyan-400" : "bg-cyan-500/5 border-cyan-500/15 text-cyan-400"}`}>
                      <BicepsFlexed className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black tracking-widest text-slate-355 uppercase">PROTEIN</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Muscle Repair</p>
                    </div>
                  </div>
                  {isGoalMet ? (
                    <span className="text-[9px] font-black tracking-widest uppercase bg-cyan-950/80 border border-cyan-400 text-cyan-400 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(34,211,238,0.25)]">
                      ✓ SECURED
                    </span>
                  ) : (
                    <span className="text-[9px] font-black tracking-widest uppercase bg-slate-950/80 border border-slate-800 text-slate-500 px-2 py-0.5 rounded">
                      CHARGING
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-black text-white leading-none font-mono tracking-tight">
                      {foodTelemetry.protein}g
                    </span>
                    <span className="text-xs text-slate-400 font-bold font-mono">
                      / {proteinTarget}g Target
                    </span>
                  </div>

                  {/* Glowing Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-slate-950/80 overflow-hidden border border-slate-850">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: "#22d3ee",
                        boxShadow: isGoalMet ? "0 0 12px #22d3ee" : "0 0 6px #22d3ee"
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Fiber Card (System Utility) */}
          {(() => {
            const isGoalMet = foodTelemetry.fiber >= fiberTarget;
            const progressPercent = Math.min(100, Math.round((foodTelemetry.fiber / fiberTarget) * 100));
            return (
              <div
                className={`rounded-2xl border p-5 backdrop-blur-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[155px] ${isGoalMet
                    ? "border-emerald-500 bg-emerald-950/15 shadow-[0_0_20px_rgba(16,185,129,0.22)]"
                    : "border-emerald-500/20 bg-slate-900/40 hover:border-emerald-500/45 hover:shadow-[0_0_20px_rgba(16,185,129,0.06)]"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border transition-colors duration-300 ${isGoalMet ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-405" : "bg-emerald-500/5 border-emerald-500/15 text-emerald-400"}`}>
                      <Leaf className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black tracking-widest text-slate-355 uppercase">FIBER</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">System Utility</p>
                    </div>
                  </div>
                  {isGoalMet ? (
                    <span className="text-[9px] font-black tracking-widest uppercase bg-emerald-950/80 border border-emerald-500 text-emerald-400 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                      ✓ OPTIMAL
                    </span>
                  ) : (
                    <span className="text-[9px] font-black tracking-widest uppercase bg-slate-950/80 border border-slate-800 text-slate-500 px-2 py-0.5 rounded">
                      CHARGING
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-black text-white leading-none font-mono tracking-tight">
                      {foodTelemetry.fiber.toFixed(1)}g
                    </span>
                    <span className="text-xs text-slate-400 font-bold font-mono">
                      / {fiberTarget}g Target
                    </span>
                  </div>

                  {/* Glowing Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-slate-950/80 overflow-hidden border border-slate-850">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: "#10b981",
                        boxShadow: isGoalMet ? "0 0 12px #10b981" : "0 0 6px #10b981"
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 2. MAIN 3-COLUMN ASYMMETRIC GRID VIEW */}
      <div className="grid gap-6 grid-cols-12">
        {/* Left Column: Interactive Biometric Matrix SVG (col-span-5) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col">
          <div className="p-6 bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-2xl relative h-[480px] flex flex-col items-center justify-between overflow-hidden flex-1">
            {/* Medical Scanning Line Laser */}
            {isScanning && (
              <motion.div
                animate={{ translateY: ["0px", "320px", "0px"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute left-0 right-0 h-[2px] bg-cyan-500/35 shadow-[0_0_12px_rgba(34,211,238,0.7)] z-10 pointer-events-none"
              />
            )}

            <div className="w-full flex items-center justify-between border-b border-slate-850 pb-3 mb-2 z-10">
              <h3 className="text-xs font-black tracking-widest text-slate-450 uppercase flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Biometric Matrix
              </h3>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded">
                Muscle Scanner
              </span>
            </div>

            {/* SVG Interactive Human Asset Base & Callouts */}
            <div className="relative w-full max-w-[380px] h-[280px] mx-auto z-10">
              {/* SVG Connecting Lines Overlay */}
              {!isScanning && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 380 280">
                  {/* Draw paths */}
                  {/* Left Side: Head, Shoulders, Arms, Legs */}
                  {/* Head (Brain) */}
                  <path
                    d="M 190,32 L 140,32 L 120,25 L 98,25"
                    fill="none"
                    stroke={hoveredZone === "head" ? "#c084fc" : "#a855f7"}
                    strokeWidth={hoveredZone === "head" ? 1.5 : 0.8}
                    opacity={hoveredZone && hoveredZone !== "head" ? 0.2 : 0.65}
                    style={{ transition: "all 0.3s" }}
                  />
                  {/* Shoulders */}
                  <path
                    d="M 173,73 L 140,73 L 120,97 L 98,97"
                    fill="none"
                    stroke={hoveredZone === "shoulders" ? "#22d3ee" : "#06b6d4"}
                    strokeWidth={hoveredZone === "shoulders" ? 1.5 : 0.8}
                    opacity={hoveredZone && hoveredZone !== "shoulders" ? 0.2 : 0.65}
                    style={{ transition: "all 0.3s" }}
                  />
                  {/* Arms */}
                  <path
                    d="M 158,120 L 140,120 L 120,169 L 98,169"
                    fill="none"
                    stroke={hoveredZone === "arms" ? "#22d3ee" : "#06b6d4"}
                    strokeWidth={hoveredZone === "arms" ? 1.5 : 0.8}
                    opacity={hoveredZone && hoveredZone !== "arms" ? 0.2 : 0.65}
                    style={{ transition: "all 0.3s" }}
                  />
                  {/* Legs */}
                  <path
                    d="M 171,200 L 145,200 L 125,241 L 98,241"
                    fill="none"
                    stroke={hoveredZone === "legs" ? "#22d3ee" : "#06b6d4"}
                    strokeWidth={hoveredZone === "legs" ? 1.5 : 0.8}
                    opacity={hoveredZone && hoveredZone !== "legs" ? 0.2 : 0.65}
                    style={{ transition: "all 0.3s" }}
                  />

                  {/* Right Side: Back, Chest, Core */}
                  {/* Back */}
                  <path
                    d="M 205,100 L 230,100 L 250,32 L 282,32"
                    fill="none"
                    stroke={hoveredZone === "back" ? "#22d3ee" : "#06b6d4"}
                    strokeWidth={hoveredZone === "back" ? 1.5 : 0.8}
                    opacity={hoveredZone && hoveredZone !== "back" ? 0.2 : 0.65}
                    style={{ transition: "all 0.3s" }}
                  />
                  {/* Chest */}
                  <path
                    d="M 200,85 L 230,85 L 250,112 L 282,112"
                    fill="none"
                    stroke={hoveredZone === "chest" ? "#22d3ee" : "#06b6d4"}
                    strokeWidth={hoveredZone === "chest" ? 1.5 : 0.8}
                    opacity={hoveredZone && hoveredZone !== "chest" ? 0.2 : 0.65}
                    style={{ transition: "all 0.3s" }}
                  />
                  {/* Core */}
                  <path
                    d="M 190,120 L 230,120 L 250,192 L 282,192"
                    fill="none"
                    stroke={hoveredZone === "abs" ? "#22d3ee" : "#06b6d4"}
                    strokeWidth={hoveredZone === "abs" ? 1.5 : 0.8}
                    opacity={hoveredZone && hoveredZone !== "abs" ? 0.2 : 0.65}
                    style={{ transition: "all 0.3s" }}
                  />

                  {/* Animated Data Extraction Pulses */}
                  {!isScanning && (
                    <>
                      {(!hoveredZone || hoveredZone === "head") && (
                        <circle r="1.5" fill="#c084fc">
                          <animateMotion dur="2s" repeatCount="indefinite" path="M 190,32 L 140,32 L 120,25 L 98,25" />
                        </circle>
                      )}
                      {(!hoveredZone || hoveredZone === "shoulders") && (
                        <circle r="1.5" fill="#22d3ee">
                          <animateMotion dur="2.4s" repeatCount="indefinite" path="M 173,73 L 140,73 L 120,97 L 98,97" />
                        </circle>
                      )}
                      {(!hoveredZone || hoveredZone === "arms") && (
                        <circle r="1.5" fill="#22d3ee">
                          <animateMotion dur="2.2s" repeatCount="indefinite" path="M 158,120 L 140,120 L 120,169 L 98,169" />
                        </circle>
                      )}
                      {(!hoveredZone || hoveredZone === "legs") && (
                        <circle r="1.5" fill="#22d3ee">
                          <animateMotion dur="2.6s" repeatCount="indefinite" path="M 171,200 L 145,200 L 125,241 L 98,241" />
                        </circle>
                      )}
                      {(!hoveredZone || hoveredZone === "back") && (
                        <circle r="1.5" fill="#22d3ee">
                          <animateMotion dur="2.1s" repeatCount="indefinite" path="M 205,100 L 230,100 L 250,32 L 282,32" />
                        </circle>
                      )}
                      {(!hoveredZone || hoveredZone === "chest") && (
                        <circle r="1.5" fill="#22d3ee">
                          <animateMotion dur="2.3s" repeatCount="indefinite" path="M 200,85 L 230,85 L 250,112 L 282,112" />
                        </circle>
                      )}
                      {(!hoveredZone || hoveredZone === "abs") && (
                        <circle r="1.5" fill="#22d3ee">
                          <animateMotion dur="2.5s" repeatCount="indefinite" path="M 190,120 L 230,120 L 250,192 L 282,192" />
                        </circle>
                      )}
                    </>
                  )}
                </svg>
              )}

              {/* The Layout grid containing Left Callouts, Center Body, Right Callouts */}
              <div className="absolute inset-0 flex justify-between items-center w-full h-full z-20">
                
                {/* Left Side Callouts */}
                <div className="w-[95px] flex flex-col justify-between h-full py-1">
                  {/* Card 1: Head */}
                  {(() => {
                    const isHeadActive = isPeakMentalPowerActive;
                    const colorClass = isHeadActive ? "text-purple-400 font-extrabold" : "text-slate-400";
                    const scoreText = isHeadActive ? "PEAK" : "NORM";
                    const isHovered = hoveredZone === "head";
                    return (
                      <div
                        onMouseEnter={() => !isScanning && setHoveredZone("head")}
                        onMouseLeave={() => setHoveredZone(null)}
                        className={`rounded-lg border p-1 bg-slate-950/85 backdrop-blur-sm cursor-pointer transition-all duration-300 ${
                          isHovered 
                            ? "border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)] scale-105" 
                            : isScanning 
                              ? "border-slate-900 opacity-20" 
                              : "border-slate-850 hover:border-slate-750"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <img src="/assets/icons/brain.png" alt="brain" className="h-4 w-4 object-contain" style={{ mixBlendMode: "screen" }} />
                          <span className="text-[7px] font-black tracking-wider text-slate-500 uppercase">Brain</span>
                        </div>
                        <div className="mt-0.5 flex justify-between items-center px-0.5">
                          <span className={`text-[9px] font-mono font-black ${colorClass}`}>{scoreText}</span>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: isHeadActive ? "#c084fc" : "#64748b" }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Card 2: Shoulders */}
                  {(() => {
                    const score = muscleGroupsProgress["shoulders"] || 0;
                    const status = getMuscleColor(score);
                    const isHovered = hoveredZone === "shoulders";
                    return (
                      <div
                        onMouseEnter={() => !isScanning && setHoveredZone("shoulders")}
                        onMouseLeave={() => setHoveredZone(null)}
                        className={`rounded-lg border p-1 bg-slate-955/85 backdrop-blur-sm cursor-pointer transition-all duration-300 ${
                          isHovered 
                            ? "border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)] scale-105" 
                            : isScanning 
                              ? "border-slate-900 opacity-20" 
                              : "border-slate-850 hover:border-slate-750"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <img src="/assets/icons/shoulders.png" alt="shoulders" className="h-4 w-4 object-contain" style={{ mixBlendMode: "screen" }} />
                          <span className="text-[7px] font-black tracking-wider text-slate-500 uppercase truncate">Shoulder</span>
                        </div>
                        <div className="mt-0.5 flex justify-between items-center px-0.5">
                          <span className={`text-[9px] font-mono font-black ${status.text}`}>{score}%</span>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.stroke }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Card 3: Arms */}
                  {(() => {
                    const score = muscleGroupsProgress["arms"] || 0;
                    const status = getMuscleColor(score);
                    const isHovered = hoveredZone === "arms";
                    return (
                      <div
                        onMouseEnter={() => !isScanning && setHoveredZone("arms")}
                        onMouseLeave={() => setHoveredZone(null)}
                        className={`rounded-lg border p-1 bg-slate-955/85 backdrop-blur-sm cursor-pointer transition-all duration-300 ${
                          isHovered 
                            ? "border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)] scale-105" 
                            : isScanning 
                              ? "border-slate-900 opacity-20" 
                              : "border-slate-850 hover:border-slate-750"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <img src="/assets/icons/arms.png" alt="arms" className="h-4 w-4 object-contain" style={{ mixBlendMode: "screen" }} />
                          <span className="text-[7px] font-black tracking-wider text-slate-500 uppercase">Arms</span>
                        </div>
                        <div className="mt-0.5 flex justify-between items-center px-0.5">
                          <span className={`text-[9px] font-mono font-black ${status.text}`}>{score}%</span>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.stroke }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Card 4: Legs */}
                  {(() => {
                    const score = muscleGroupsProgress["legs"] || 0;
                    const status = getMuscleColor(score);
                    const isHovered = hoveredZone === "legs";
                    return (
                      <div
                        onMouseEnter={() => !isScanning && setHoveredZone("legs")}
                        onMouseLeave={() => setHoveredZone(null)}
                        className={`rounded-lg border p-1 bg-slate-955/85 backdrop-blur-sm cursor-pointer transition-all duration-300 ${
                          isHovered 
                            ? "border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)] scale-105" 
                            : isScanning 
                              ? "border-slate-900 opacity-20" 
                              : "border-slate-850 hover:border-slate-750"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <img src="/assets/icons/legs.png" alt="legs" className="h-4 w-4 object-contain" style={{ mixBlendMode: "screen" }} />
                          <span className="text-[7px] font-black tracking-wider text-slate-500 uppercase">Legs</span>
                        </div>
                        <div className="mt-0.5 flex justify-between items-center px-0.5">
                          <span className={`text-[9px] font-mono font-black ${status.text}`}>{score}%</span>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.stroke }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Center: Interactive Humanoid Map */}
                <div className="relative w-[130px] h-[260px] flex items-center justify-center">
                  <BodyPartVectorMap
                    selectedPart={null}
                    hoveredPart={hoveredZone}
                    onHoverPart={(part) => {
                      if (!isScanning) {
                        if (part === "Head") setHoveredZone("head");
                        else if (part === "Shoulders") setHoveredZone("shoulders");
                        else if (part === "Chest") setHoveredZone("chest");
                        else if (part === "Back") setHoveredZone("back");
                        else if (part === "Core") setHoveredZone("abs");
                        else if (part === "Arms") setHoveredZone("arms");
                        else if (part === "Legs") setHoveredZone("legs");
                        else setHoveredZone(null);
                      }
                    }}
                    interactive={!isScanning}
                    size="large"
                    pulseActive={isScanning}
                    className="scale-[1.1]"
                    completedParts={isPeakMentalPowerActive ? completedParts : []}
                    headGlowColor={isPeakMentalPowerActive ? "#a855f7" : undefined}
                  />
                </div>

                {/* Right Side Callouts */}
                <div className="w-[95px] flex flex-col justify-between h-[220px] py-1">
                  {/* Card 5: Back */}
                  {(() => {
                    const score = muscleGroupsProgress["back"] || 0;
                    const status = getMuscleColor(score);
                    const isHovered = hoveredZone === "back";
                    return (
                      <div
                        onMouseEnter={() => !isScanning && setHoveredZone("back")}
                        onMouseLeave={() => setHoveredZone(null)}
                        className={`rounded-lg border p-1 bg-slate-955/85 backdrop-blur-sm cursor-pointer transition-all duration-300 ${
                          isHovered 
                            ? "border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)] scale-105" 
                            : isScanning 
                              ? "border-slate-900 opacity-20" 
                              : "border-slate-850 hover:border-slate-750"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <img src="/assets/icons/back.png" alt="back" className="h-4 w-4 object-contain" style={{ mixBlendMode: "screen" }} />
                          <span className="text-[7px] font-black tracking-wider text-slate-500 uppercase">Back</span>
                        </div>
                        <div className="mt-0.5 flex justify-between items-center px-0.5">
                          <span className={`text-[9px] font-mono font-black ${status.text}`}>{score}%</span>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.stroke }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Card 6: Chest */}
                  {(() => {
                    const score = muscleGroupsProgress["chest"] || 0;
                    const status = getMuscleColor(score);
                    const isHovered = hoveredZone === "chest";
                    return (
                      <div
                        onMouseEnter={() => !isScanning && setHoveredZone("chest")}
                        onMouseLeave={() => setHoveredZone(null)}
                        className={`rounded-lg border p-1 bg-slate-955/85 backdrop-blur-sm cursor-pointer transition-all duration-300 ${
                          isHovered 
                            ? "border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)] scale-105" 
                            : isScanning 
                              ? "border-slate-900 opacity-20" 
                              : "border-slate-850 hover:border-slate-750"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <img src="/assets/icons/chest.png" alt="chest" className="h-4 w-4 object-contain" style={{ mixBlendMode: "screen" }} />
                          <span className="text-[7px] font-black tracking-wider text-slate-500 uppercase">Chest</span>
                        </div>
                        <div className="mt-0.5 flex justify-between items-center px-0.5">
                          <span className={`text-[9px] font-mono font-black ${status.text}`}>{score}%</span>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.stroke }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Card 7: Abs / Core */}
                  {(() => {
                    const score = muscleGroupsProgress["abs"] || 0;
                    const status = getMuscleColor(score);
                    const isHovered = hoveredZone === "abs";
                    return (
                      <div
                        onMouseEnter={() => !isScanning && setHoveredZone("abs")}
                        onMouseLeave={() => setHoveredZone(null)}
                        className={`rounded-lg border p-1 bg-slate-955/85 backdrop-blur-sm cursor-pointer transition-all duration-300 ${
                          isHovered 
                            ? "border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)] scale-105" 
                            : isScanning 
                              ? "border-slate-900 opacity-20" 
                              : "border-slate-850 hover:border-slate-750"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <img src="/assets/icons/abs.png" alt="abs" className="h-4 w-4 object-contain" style={{ mixBlendMode: "screen" }} />
                          <span className="text-[7px] font-black tracking-wider text-slate-500 uppercase">Core</span>
                        </div>
                        <div className="mt-0.5 flex justify-between items-center px-0.5">
                          <span className={`text-[9px] font-mono font-black ${status.text}`}>{score}%</span>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.stroke }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>
            </div>

            {/* Context-Aware Diagnostics Telemetry Terminal */}
            <div className="w-full bg-slate-955/80 border border-slate-850/80 p-3 rounded-xl min-h-[90px] z-10 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {isScanning ? (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2 text-center"
                  >
                    <p className="text-[10px] font-black tracking-widest text-cyan-400 uppercase animate-pulse">
                      Analyzing muscle group telemetry...
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 rounded-full bg-slate-950 overflow-hidden border border-slate-900">
                        <div
                          className="h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] transition-all duration-100"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-black text-cyan-400">{scanProgress}%</span>
                    </div>
                  </motion.div>
                ) : hoveredZone ? (
                  hoveredZone === "head" ? (
                    <motion.div
                      key="head"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950/80 border border-slate-800 p-1 overflow-hidden">
                        <img
                          src="/assets/icons/brain.png"
                          alt="brain"
                          className="h-10 w-10 object-contain"
                          style={{ mixBlendMode: "screen" }}
                        />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <p className="text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 text-purple-400">
                          <Brain className="h-3.5 w-3.5" /> Brain/Head Diagnostics
                        </p>
                        <p className="text-[11px] text-slate-300 font-bold">
                          Mental Capacity: <span className="font-black text-white">{isPeakMentalPowerActive ? "PEAK PERFORMANCE" : "NORMAL OUTPUT"}</span>
                        </p>
                        <p className="text-[9px] text-slate-450 leading-relaxed">
                          {isPeakMentalPowerActive
                            ? "🔮 Peak performance active. Your brain node is illuminated with purple electric currents."
                            : "💤 Normal capacity. Log an exam score above 90% in main exam to trigger peak performance."}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={hoveredZone}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950/80 border border-slate-800 p-1 overflow-hidden">
                        <img
                          src={`/assets/icons/${hoveredZone}.png`}
                          alt={hoveredZone}
                          className="h-10 w-10 object-contain"
                          style={{ mixBlendMode: "screen" }}
                        />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <p className="text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5" style={{ color: getMuscleColor(muscleGroupsProgress[hoveredZone]).stroke }}>
                          <Dumbbell className="h-3.5 w-3.5" /> {hoveredZone} Diagnostics
                        </p>
                        <p className="text-[11px] text-slate-300 font-bold">
                          Weekly Completion: <span className="font-black text-white">{muscleGroupsProgress[hoveredZone]}%</span>
                        </p>
                        <p className="text-[9px] text-slate-450 leading-relaxed">
                          {muscleGroupsProgress[hoveredZone] < 50
                            ? "⚠️ Underdeveloped area. Increase weekly target sets to improve status."
                            : muscleGroupsProgress[hoveredZone] <= 70
                              ? "🟡 Acceptable output. Steady work completed."
                              : "🟢 High-level execution! Muscle group fully stimulated."
                          }
                        </p>
                      </div>
                    </motion.div>
                  )
                ) : (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-1.5 text-center py-0.5"
                  >
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest animate-pulse flex items-center justify-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-cyan-400 shrink-0" /> SYSTEM TELEMETRY ONLINE
                    </p>
                    <p className="text-[9px] text-slate-400 font-semibold max-w-[320px] mx-auto leading-relaxed">
                      {isPeakMentalPowerActive 
                        ? "🔮 Neural core at peak performance. Interactive mapping synced with weekly exercise status. Select a node to query detailed telemetry."
                        : "🔗 Local biomechanical bridge active. Hover or click specific nodes on the humanoid matrix to run diagnostics."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Scan again button */}
            {!isScanning && (
              <button
                type="button"
                onClick={handleStartScan}
                className="mt-3 w-full rounded-xl border border-cyan-500/25 bg-cyan-550/5 hover:bg-cyan-500/10 py-2.5 text-[10px] font-black uppercase tracking-wider text-cyan-400 active:scale-97 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Scan Biometrics Again
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Resource Flow & Skill Tree Tracker (col-span-7) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">

          {/* A. Resource Flow Engine (Money Module) */}
          <div className="p-5 bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-2xl h-[228px] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-850/60 pb-2 mb-2">
              <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-400" /> Resource Flow Engine
              </h3>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Income</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Expense</span>
              </div>
            </div>

            <div className="w-full h-36 mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={resourceFlowData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "12px", fontSize: "10px" }}
                    labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                    itemStyle={{ color: "#f8fafc" }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#incomeGlow)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#expenseGlow)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* B. Skill Tree Tracker (Learning Module) */}
          <div className="p-5 bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-2xl h-[228px] flex items-center justify-between">
            <div className="w-1/2 flex flex-col justify-between h-full py-1">
              <div>
                <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-indigo-400" /> Skill Matrix Hub
                </h3>
                <span className="text-3xl font-black text-slate-100 mt-3 block tracking-wide">
                  {learningTelemetry.hours} <span className="text-xs text-slate-500 font-bold">HRS</span>
                </span>
                <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider block mt-1">
                  Study Session Target: {learningTelemetry.target} Hrs
                </span>
              </div>

              {/* Exam Alert Notification */}
              {learningTelemetry.closestExam ? (
                <div className="flex items-center gap-2 text-red-400 bg-red-950/50 border border-red-800/80 p-2.5 rounded-xl animate-pulse shadow-[0_0_12px_rgba(153,27,27,0.4)]">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  <div className="overflow-hidden leading-tight">
                    <span className="text-[9px] font-black tracking-wider uppercase block text-red-100">CRITICAL WAR</span>
                    <span className="text-[9px] font-bold text-slate-300 truncate block">
                      {learningTelemetry.closestExam.title} ({learningTelemetry.closestExam.date})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 bg-slate-950/40 border border-slate-850 p-2 rounded-xl">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">No active upcoming exam target</span>
                </div>
              )}
            </div>

            {/* Radial Loading Gauge */}
            <div className="w-32 h-32 relative flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  barSize={10}
                  data={studyProgressData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    background={{ fill: "#33415520" }}
                    dataKey="value"
                    cornerRadius={5}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-200">{studyProgressData[0].value}%</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Focus</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. BOUNTY BOARD NODES (Tasks module Integration) */}
      <div
        className="rounded-2xl border bg-slate-900/40 p-5 backdrop-blur-sm transition-all duration-300"
        style={{ borderColor: `${accentColor}20` }}
      >
        <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
          <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
            <ListTodo className="h-4 w-4 text-amber-400" /> Bounty Board Nodes
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-xl">
            {taskTelemetry.completed} / {taskTelemetry.total} Completed
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs italic">
            No bounties active. Add tasks inside the Tasks module to list them here.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleDashboardTask(task.id)}
                className={`flex items-center gap-3 rounded-xl border p-3.5 bg-slate-950/45 cursor-pointer select-none active:scale-[0.98] transition-all hover:border-slate-700 ${task.completed ? "opacity-60 border-slate-900" : "border-slate-850"
                  }`}
              >
                <button
                  type="button"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {task.completed ? (
                    <CheckSquare className="h-5 w-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="h-5 w-5 text-slate-600 shrink-0" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${task.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                    {task.title}
                  </p>
                  <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1.5 border tracking-wider ${task.priority === "high"
                    ? "bg-rose-950/50 border-rose-900 text-rose-350"
                    : task.priority === "medium"
                      ? "bg-amber-950/50 border-amber-900 text-amber-350"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
