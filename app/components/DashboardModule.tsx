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
      abs: 20
    };

    const groups = ["chest", "legs", "back", "arms", "abs"];
    const results: Record<string, number> = {};

    groups.forEach((group) => {
      const related = workouts.filter((w) => {
        const bp = w.bodyPart.toLowerCase();
        if (group === "chest") return bp.includes("chest");
        if (group === "legs") return bp.includes("leg");
        if (group === "back") return bp.includes("back") || bp.includes("shoulder");
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

  const [hoveredZone, setHoveredZone] = useState<"chest" | "legs" | "back" | "arms" | "abs" | "head" | null>(null);

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
                className={`rounded-2xl border p-5 backdrop-blur-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[155px] ${
                  isOverloaded
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
                className={`rounded-2xl border p-5 backdrop-blur-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[155px] ${
                  isGoalMet
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
                className={`rounded-2xl border p-5 backdrop-blur-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[155px] ${
                  isGoalMet
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

            {/* SVG Interactive Human Asset Base */}
            <div className="relative w-56 h-[290px] mx-auto py-2">
              {/* Generated Biometric Base Graphic */}
              <img 
                src="/cybernetic_body.png" 
                alt="Biometric Scan Base" 
                className="absolute inset-0 w-full h-full object-contain scale-[1.25] pointer-events-none opacity-55 mix-blend-screen z-0 filter brightness-110 contrast-125"
              />
              <svg
                className="absolute inset-0 w-full h-full text-slate-800 transition-all duration-300 filter drop-shadow-[0_0_25px_rgba(34,211,238,0.12)] z-10"
                viewBox="0 0 100 200"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.0"
              >
                {/* 0. HEAD/BRAIN TARGET (Interactive Zone) */}
                <motion.g
                  className="cursor-pointer"
                  onMouseEnter={() => !isScanning && setHoveredZone("head")}
                  onMouseLeave={() => setHoveredZone(null)}
                >
                  <circle 
                    cx="50" 
                    cy="14" 
                    r="5" 
                    stroke={segmentStroke("head")} 
                    fill={segmentFill("head")} 
                    className="transition-all duration-300"
                    strokeWidth="1.2"
                  />
                  <circle 
                    cx="50" 
                    cy="14" 
                    r="1.2" 
                    className={isPeakMentalPowerActive ? "fill-purple-400" : "fill-slate-500"} 
                  />
                  {/* Callout line and text */}
                  <path 
                    d="M 54,14 L 74,14 L 78,8" 
                    className={isPeakMentalPowerActive ? "stroke-purple-500/50" : "stroke-slate-500/30"} 
                    strokeWidth="0.8" 
                    strokeDasharray="1.5,1.5" 
                  />
                  <text 
                    x="79" 
                    y="7" 
                    className={`text-[2.7px] font-mono font-black tracking-wider uppercase ${isPeakMentalPowerActive ? "fill-purple-400" : "fill-slate-400"}`}
                  >
                    BRAIN NODE
                  </text>
                  <text 
                    x="79" 
                    y="10" 
                    className={`text-[2.0px] font-mono font-bold tracking-wider uppercase ${isPeakMentalPowerActive ? "fill-purple-300/70" : "fill-slate-500"}`}
                  >
                    {isPeakMentalPowerActive ? "PEAK MENTAL POWER" : "NORMAL OUTPUT"}
                  </text>
                </motion.g>

                {/* 1. CHEST TARGET (Interactive Zone) */}
                <motion.g
                  className="cursor-pointer"
                  onMouseEnter={() => !isScanning && setHoveredZone("chest")}
                  onMouseLeave={() => setHoveredZone(null)}
                >
                  <circle 
                    cx="50" 
                    cy="52" 
                    r="8" 
                    stroke={segmentStroke("chest")} 
                    fill={segmentFill("chest")} 
                    className="transition-colors duration-200"
                    strokeWidth="1.2"
                  />
                  <circle cx="50" cy="52" r="1.5" className="fill-cyan-400" />
                  <path d="M 40,52 L 45,52 M 55,52 L 60,52 M 50,42 L 50,47 M 50,57 L 50,62" className="stroke-cyan-500/35" strokeWidth="0.8" />
                  {/* Callout line and text */}
                  <path d="M 58,52 L 74,52 L 78,38" className="stroke-cyan-500/50" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
                  <text x="79" y="34" className="fill-cyan-400 text-[2.7px] font-mono font-black tracking-wider uppercase">CHEST STATUS</text>
                  <text x="79" y="37" className="fill-cyan-400/60 text-[2.0px] font-mono font-bold tracking-wider uppercase">PECTORALS</text>
                </motion.g>

                {/* 2. ABS/CORE TARGET (Interactive Zone) */}
                <motion.g
                  className="cursor-pointer"
                  onMouseEnter={() => !isScanning && setHoveredZone("abs")}
                  onMouseLeave={() => setHoveredZone(null)}
                >
                  <circle 
                    cx="50" 
                    cy="80" 
                    r="8" 
                    stroke={segmentStroke("abs")} 
                    fill={segmentFill("abs")} 
                    className="transition-colors duration-200"
                    strokeWidth="1.2"
                  />
                  {/* Lightning Bolt */}
                  <path d="M 50,77 L 48.5,80 L 50,80 L 50,83 L 51.5,80 L 50,80 Z" className="fill-yellow-400 stroke-none" />
                  <path d="M 58,80 L 74,80 L 78,86" className="stroke-yellow-400/50" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
                  <text x="79" y="85" className="fill-yellow-400 text-[2.7px] font-mono font-black tracking-wider uppercase">ENERGY CORE</text>
                  <text x="79" y="88" className="fill-yellow-400/60 text-[2.0px] font-mono font-bold tracking-wider uppercase">MACROS OPTIMAL</text>
                </motion.g>

                {/* 3. ARMS TARGET (Interactive Zone) */}
                <motion.g
                  className="cursor-pointer"
                  onMouseEnter={() => !isScanning && setHoveredZone("arms")}
                  onMouseLeave={() => setHoveredZone(null)}
                >
                  {/* Left Arm HUD Ring */}
                  <ellipse 
                    cx="22" 
                    cy="75" 
                    rx="6" 
                    ry="3" 
                    transform="rotate(-20, 22, 75)" 
                    stroke={segmentStroke("arms")} 
                    fill={segmentFill("arms")}
                    strokeWidth="1.2"
                  />
                  {/* Right Arm HUD Ring */}
                  <ellipse 
                    cx="78" 
                    cy="75" 
                    rx="6" 
                    ry="3" 
                    transform="rotate(20, 78, 75)" 
                    stroke={segmentStroke("arms")} 
                    fill={segmentFill("arms")}
                    strokeWidth="1.2"
                  />
                  <circle cx="22" cy="75" r="1.5" className="fill-cyan-400" />
                  <circle cx="78" cy="75" r="1.5" className="fill-cyan-400" />
                  <path d="M 16,75 L 4,75 L 4,63" className="stroke-cyan-400/50" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
                  {/* Dumbbell Icon representation */}
                  <path d="M 1,57.5 L 3,57.5 M 1,56.5 L 1,58.5 M 3,56.5 L 3,58.5" className="stroke-cyan-400" strokeWidth="0.8" />
                  <text x="6" y="57" className="fill-cyan-400 text-[2.7px] font-mono font-black tracking-wider uppercase">UPPER BODY: 82%</text>
                  <text x="6" y="60" className="fill-cyan-400/60 text-[2.0px] font-mono font-bold tracking-wider uppercase">STRENGTH / REPAIR</text>
                </motion.g>

                {/* 4. LEGS TARGET (Interactive Zone) */}
                <motion.g
                  className="cursor-pointer"
                  onMouseEnter={() => !isScanning && setHoveredZone("legs")}
                  onMouseLeave={() => setHoveredZone(null)}
                >
                  <circle 
                    cx="38.5" 
                    cy="136" 
                    r="6" 
                    stroke={segmentStroke("legs")} 
                    fill={segmentFill("legs")} 
                    className="transition-colors duration-200"
                    strokeWidth="1.2"
                  />
                  <circle 
                    cx="61.5" 
                    cy="136" 
                    r="6" 
                    stroke={segmentStroke("legs")} 
                    fill={segmentFill("legs")} 
                    className="transition-colors duration-200"
                    strokeWidth="1.2"
                  />
                  <circle cx="38.5" cy="136" r="1.5" className="fill-emerald-400" />
                  <circle cx="61.5" cy="136" r="1.5" className="fill-emerald-400" />
                  <path d="M 32.5,136 L 22,136 L 18,145" className="stroke-emerald-400/50" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
                  <text x="2" y="149" className="fill-emerald-400 text-[2.7px] font-mono font-black tracking-wider uppercase">LOWER BODY: 88%</text>
                  <text x="2" y="152" className="fill-emerald-400/60 text-[2.0px] font-mono font-bold tracking-wider uppercase">MOBILITY / END</text>
                </motion.g>

                {/* 5. BACK TARGET (Interactive Zone) */}
                <motion.g
                  className="cursor-pointer"
                  onMouseEnter={() => !isScanning && setHoveredZone("back")}
                  onMouseLeave={() => setHoveredZone(null)}
                >
                  <polygon 
                    points="50,26 56,31 50,36 44,31" 
                    stroke={segmentStroke("back")} 
                    fill={segmentFill("back")} 
                    className="transition-colors duration-200"
                    strokeWidth="1.2"
                  />
                  <circle cx="50" cy="31" r="1.5" className="fill-indigo-400" />
                  <path d="M 44,31 L 30,31 L 26,23" className="stroke-indigo-400/50" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
                  <text x="2" y="19" className="fill-indigo-400 text-[2.7px] font-mono font-black tracking-wider uppercase">POSTERIOR CHAIN</text>
                  <text x="2" y="22" className="fill-indigo-400/60 text-[2.0px] font-mono font-bold tracking-wider uppercase">BACK METRICS</text>
                </motion.g>

                {/* Ground Target Metrics */}
                <g className="pointer-events-none opacity-40">
                  <line x1="20" y1="192" x2="80" y2="192" className="stroke-cyan-500/40" strokeWidth="0.8" />
                  <ellipse cx="50" cy="192" rx="32" ry="4" className="stroke-cyan-500/20 fill-none" strokeWidth="0.8" />
                </g>
              </svg>
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
                      className="space-y-1"
                    >
                      <p className="text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 text-purple-405">
                        <Brain className="h-3.5 w-3.5" /> Brain/Head Telemetry Diagnostics
                      </p>
                      <p className="text-xs text-slate-350">
                        Mental Capacity: <span className="font-black text-white">{isPeakMentalPowerActive ? "PEAK PERFORMANCE" : "NORMAL OUTPUT"}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {isPeakMentalPowerActive
                          ? "🔮 Peak performance active. Your brain node is illuminated with purple electric currents."
                          : "💤 Normal capacity. Log an exam score above 80% to trigger peak performance."}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={hoveredZone}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-1"
                    >
                      <p className="text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5" style={{ color: getMuscleColor(muscleGroupsProgress[hoveredZone]).stroke }}>
                        <Dumbbell className="h-3.5 w-3.5" /> {hoveredZone} Telemetry Diagnostics
                      </p>
                      <p className="text-xs text-slate-350">
                        Weekly Completion: <span className="font-black text-white">{muscleGroupsProgress[hoveredZone]}%</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {muscleGroupsProgress[hoveredZone] < 50
                          ? "⚠️ Underdeveloped area. Increase weekly target sets to improve status."
                          : muscleGroupsProgress[hoveredZone] <= 70
                            ? "🟡 Acceptable output. Steady work completed."
                            : "🟢 High-level execution! Muscle group fully stimulated."
                        }
                      </p>
                    </motion.div>
                  )
                ) : (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Weekly Muscle Diagnostics Matrix
                    </p>
                    <div className="grid grid-cols-5 gap-1.5 text-center">
                      {["chest", "legs", "back", "arms", "abs"].map((m) => {
                        const score = muscleGroupsProgress[m];
                        const status = getMuscleColor(score);
                        return (
                          <div key={m} className="bg-slate-955 border border-slate-900 p-1.5 rounded-lg">
                            <span className="text-[9px] font-bold text-slate-500 uppercase block">{m}</span>
                            <span className={`text-xs font-black ${status.text} block mt-0.5`}>{score}%</span>
                          </div>
                        );
                      })}
                    </div>
                    {isPeakMentalPowerActive && (
                      <div className="mt-2 text-center bg-purple-950/40 border border-purple-900/40 px-2.5 py-1.5 rounded-xl shadow-[0_0_10px_rgba(168,85,247,0.15)] flex items-center justify-center gap-1.5">
                        <Brain className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                        <span className="text-[9px] font-black text-purple-300 uppercase tracking-wider font-sans">
                          BRAIN IN PEAK PERFORMANCE
                        </span>
                      </div>
                    )}
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
