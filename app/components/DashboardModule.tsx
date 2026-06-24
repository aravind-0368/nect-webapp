"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle, AlertCircle, BookOpen, Flame, Zap, Apple, Beef,
  Brain, Dumbbell, Utensils, DollarSign, ListTodo,
  Calendar, CheckSquare, Square, RefreshCw, Leaf, BicepsFlexed,
  Timer
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
  age?: number;
  biologicalSex?: "Men" | "Women";
  activityMultiplier?: "Sedentary" | "Lightly Active" | "Moderately Active" | "Very Active";
  proteinActivityFactor?: "Sedentary" | "Active" | "Strength";
}

export function DashboardModule({
  points,
  accentColor,
  weight: propWeight,
  height: propHeight,
  age: propAge,
  biologicalSex: propSex,
  activityMultiplier: propActivity,
  proteinActivityFactor: propProteinFactor,
}: DashboardModuleProps) {
  const {
    powerStreak,
    smartStreak,
    healthyStreak,
    visibleModules,
    awardPoints,
    peakMentalPowerUntil,
    lastMainExamCompletedAt,
    lastMainExamScore,
    lastMainExamTitle,
    incrementPowerStreak,
    incrementSmartStreak,
    incrementHealthyStreak
  } = useNectStore();

  const isPeakMentalPowerActive = useMemo(() => {
    return peakMentalPowerUntil ? Date.now() < peakMentalPowerUntil : false;
  }, [peakMentalPowerUntil]);

  const weight = propWeight ?? 75;
  const height = propHeight ?? 180;
  const age = propAge ?? 25;
  const biologicalSex = propSex ?? "Men";
  const activityMultiplier = propActivity ?? "Moderately Active";
  const proteinActivityFactor = propProteinFactor ?? "Strength";

  const calculatedTargets = useMemo(() => {
    const bmr = biologicalSex === "Men"
      ? (10 * weight) + (6.25 * height) - (5 * age) + 5
      : (10 * weight) + (6.25 * height) - (5 * age) - 161;

    let multiplier = 1.55;
    if (activityMultiplier === "Sedentary") multiplier = 1.2;
    else if (activityMultiplier === "Lightly Active") multiplier = 1.375;
    else if (activityMultiplier === "Moderately Active") multiplier = 1.55;
    else if (activityMultiplier === "Very Active") multiplier = 1.725;

    const tdee = bmr * multiplier;

    let proteinMultiplier = 2.0;
    if (proteinActivityFactor === "Sedentary") proteinMultiplier = 1.0;
    else if (proteinActivityFactor === "Active") proteinMultiplier = 1.4;
    else if (proteinActivityFactor === "Strength") proteinMultiplier = 2.0;

    const protein = weight * proteinMultiplier;
    const fiber = (tdee / 1000) * 14;

    return {
      calories: Math.round(tdee),
      protein: Math.round(protein),
      fiber: Math.round(fiber * 10) / 10
    };
  }, [weight, height, age, biologicalSex, activityMultiplier, proteinActivityFactor]);

  const caloriesTarget = calculatedTargets.calories;
  const proteinTarget = calculatedTargets.protein;
  const fiberTarget = calculatedTargets.fiber;

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

  const tierProgress = useMemo(() => {
    if (activeRank.max === Infinity) return 100;
    const range = activeRank.max - activeRank.min + 1;
    const current = points - activeRank.min;
    return Math.min(100, Math.max(0, (current / range) * 100));
  }, [points, activeRank]);

  const [synapticExpired, setSynapticExpired] = useState(true);

  useEffect(() => {
    if (!lastMainExamCompletedAt) {
      setSynapticExpired(true);
      return;
    }
    
    const checkExpiry = () => {
      const elapsed = Date.now() - lastMainExamCompletedAt;
      const fortyEightHours = 48 * 60 * 60 * 1000;
      setSynapticExpired(elapsed >= fortyEightHours);
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [lastMainExamCompletedAt]);

  const showSynapticGateway = !synapticExpired;

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

  const getWorkoutStatus = (pct: number) => {
    if (pct === 100) return { label: "PEAK CONDITION", color: "#a855f7" };
    if (pct >= 80) return { label: "OPTIMIZED", color: "#166534" }; // dark green
    if (pct >= 60) return { label: "STABLE", color: "#ca8a04" }; // yellow
    if (pct >= 40) return { label: "LOW OUTPUT", color: "#ef4444" }; // light red
    return { label: "CRITICAL FAULT", color: "#991b1b" }; // dark red
  };

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

  const averageWeeklyCompliance = useMemo(() => {
    const groups = ["chest", "shoulders", "abs", "back", "arms", "legs"];
    const physicalTotal = groups.reduce((sum, g) => sum + (muscleGroupsProgress[g] ?? 0), 0);
    const brainScore = Math.min(100, Math.round((learningTelemetry.hours / learningTelemetry.target) * 100));
    return Math.round((physicalTotal + brainScore) / (groups.length + 1));
  }, [muscleGroupsProgress, learningTelemetry]);

  const overallPerformance = useMemo(() => {
    return getWorkoutStatus(averageWeeklyCompliance);
  }, [averageWeeklyCompliance]);

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
      targetCal: caloriesTarget,
      protein,
      fiber
    };
  }, [foodPlate, caloriesTarget]);

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

  // Radial Chart Gauge Data & Info for Study progress
  const studyProgressDetails = useMemo(() => {
    const focusPct = Math.min(100, Math.round((learningTelemetry.hours / learningTelemetry.target) * 100));
    
    const completedRevisions = revisions.filter(r => r.checked).length;
    const totalRevisions = revisions.length || 5;
    const revisionsPct = Math.min(100, Math.round((completedRevisions / totalRevisions) * 100));

    const uniqueSubCount = new Set([
      ...sessions.map(s => s.subject?.toLowerCase().trim()),
      ...revisions.map(r => r.name?.toLowerCase().trim())
    ].filter(Boolean)).size;

    const chartData = [
      { name: "Revisions", value: revisionsPct, fill: "var(--rank-accent)" }
    ];

    return {
      chartData,
      hours: learningTelemetry.hours,
      target: learningTelemetry.target,
      uniqueSubCount,
      completedRevisions,
      totalRevisions,
      revisionsPct
    };
  }, [learningTelemetry, sessions, revisions]);

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
      {/* 1. TOP STATUS HEADER (Progression Singularity, Streaks & Diagnostics) */}
      <div
        className="rounded-2xl border bg-slate-900/40 p-6 backdrop-blur-sm transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6 relative"
        style={{ borderColor: `color-mix(in srgb, var(--rank-accent) 15%, transparent)`, boxShadow: `0 4px 20px color-mix(in srgb, var(--rank-accent) 3%, transparent)` }}
      >
        {/* Left: Dashboard Header Title */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left shrink-0">
          <h1 className="text-3xl font-black text-white uppercase tracking-wider">DASHBOARD</h1>
          <span className="text-[10px] font-black tracking-[0.2em] text-[var(--rank-accent)] mt-1.5 uppercase">SYSTEM OVERVIEW</span>
        </div>

        {/* Center: The Progression Singularity (Rank badge and name only) */}
        <div className="md:absolute md:left-1/2 md:-translate-x-1/2 flex flex-col items-center justify-center gap-1.5 select-none pointer-events-none">
          <img
            src={`/assets/ranks/${activeRank.name.toLowerCase()}.svg`}
            alt={`${activeRank.name} Rank Badge`}
            className="h-14 w-14 object-contain"
          />
          <div className="text-center">
            <span className="block text-[8px] font-black tracking-[0.25em] text-slate-500 uppercase leading-none">RANK</span>
            <span 
              className="block text-sm font-black uppercase tracking-wider mt-1" 
              style={{ 
                color: activeRank.color, 
                textShadow: `0 0 10px ${activeRank.color}40` 
              }}
            >
              {activeRank.name}
            </span>
          </div>
        </div>

        {/* Right Cosmic Streaks Matrix */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-5 shrink-0">
          {visibleModules.Workout && (
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <button 
                type="button"
                onClick={() => incrementPowerStreak()}
                className="relative w-12 h-12 rounded-full bg-slate-950/70 border border-orange-500/30 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/60 hover:bg-orange-500/10 active:scale-95 transition-all duration-200 group shadow-[0_0_15px_rgba(249,115,22,0.05)] hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]"
                title="Increment Power Streak"
              >
                <Flame className="h-4.5 w-4.5 text-orange-500 animate-pulse group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-slate-100 font-mono mt-0.5">{powerStreak}d</span>
              </button>
              <div className="px-2 py-0.5 rounded border border-orange-500/20 bg-orange-950/30 text-[8px] font-black text-orange-400 uppercase tracking-wider leading-none shadow-sm">
                POWER
              </div>
            </div>
          )}
          {visibleModules.Learning && (
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <button 
                type="button"
                onClick={() => incrementSmartStreak()}
                className="relative w-12 h-12 rounded-full bg-slate-950/70 border border-indigo-500/30 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/60 hover:bg-indigo-500/10 active:scale-95 transition-all duration-200 group shadow-[0_0_15px_rgba(99,102,241,0.05)] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                title="Increment Smart Streak"
              >
                <Zap className="h-4.5 w-4.5 text-indigo-400 animate-pulse group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-slate-100 font-mono mt-0.5">{smartStreak}d</span>
              </button>
              <div className="px-2 py-0.5 rounded border border-indigo-500/20 bg-indigo-950/30 text-[8px] font-black text-indigo-450 uppercase tracking-wider leading-none shadow-sm">
                SMART
              </div>
            </div>
          )}
          {visibleModules.Food && (
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <button 
                type="button"
                onClick={() => incrementHealthyStreak()}
                className="relative w-12 h-12 rounded-full bg-slate-950/70 border border-emerald-500/30 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/60 hover:bg-emerald-500/10 active:scale-95 transition-all duration-200 group shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                title="Increment Healthy Streak"
              >
                <Apple className="h-4.5 w-4.5 text-emerald-400 animate-pulse group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-slate-100 font-mono mt-0.5">{healthyStreak}d</span>
              </button>
              <div className="px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-950/30 text-[8px] font-black text-emerald-400 uppercase tracking-wider leading-none shadow-sm">
                HEALTHY
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 1.5 METRIC CARDS (Fuel cells) */}
      {visibleModules.Food && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                      <span className="text-[9px] font-black tracking-widest uppercase bg-red-950/85 border border-red-500 text-red-400 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                        ⚠ OVERLOAD
                      </span>
                    ) : (
                      <span className="text-[9px] font-black tracking-widest uppercase bg-slate-950/80 border border-slate-800 text-slate-500 px-2 py-0.5 rounded">
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
                  className="rounded-2xl border p-5 backdrop-blur-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[155px]"
                  style={{
                    borderColor: isGoalMet ? "var(--rank-accent)" : "rgba(var(--rank-accent-rgb), 0.2)",
                    backgroundColor: isGoalMet ? "rgba(var(--rank-accent-rgb), 0.15)" : "rgba(30, 41, 59, 0.4)",
                    boxShadow: isGoalMet ? "var(--rank-accent-glow-strong)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isGoalMet) {
                      e.currentTarget.style.borderColor = "rgba(var(--rank-accent-rgb), 0.45)";
                      e.currentTarget.style.boxShadow = "var(--rank-accent-glow-subtle)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isGoalMet) {
                      e.currentTarget.style.borderColor = "rgba(var(--rank-accent-rgb), 0.2)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2.5 rounded-xl border transition-colors duration-300"
                        style={{
                          backgroundColor: isGoalMet ? "rgba(var(--rank-accent-rgb), 0.1)" : "rgba(var(--rank-accent-rgb), 0.05)",
                          borderColor: isGoalMet ? "rgba(var(--rank-accent-rgb), 0.35)" : "rgba(var(--rank-accent-rgb), 0.15)",
                          color: "var(--rank-accent)",
                        }}
                      >
                        <Beef className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black tracking-widest text-slate-355 uppercase">PROTEIN</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Muscle Repair</p>
                      </div>
                    </div>
                    {isGoalMet ? (
                      <span
                        className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: "rgba(var(--rank-accent-rgb), 0.2)",
                          border: "1px solid var(--rank-accent)",
                          color: "var(--rank-accent)",
                          boxShadow: "var(--rank-accent-glow-subtle)",
                        }}
                      >
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
                          backgroundColor: "var(--rank-accent)",
                          boxShadow: isGoalMet ? "var(--rank-accent-glow-strong)" : "var(--rank-accent-glow-subtle)"
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
                      <div className={`p-2.5 rounded-xl border transition-colors duration-300 ${isGoalMet ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400" : "bg-emerald-500/5 border-emerald-500/15 text-emerald-400"}`}>
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

      {/* 2. MAIN GRID VIEW */}
      <div className="grid gap-6 grid-cols-12">
        {/* Left Column: Resource Flow Engine (col-span-12 lg:col-span-6) */}
        {visibleModules.Money && (
          <div className={`col-span-12 ${visibleModules.Learning ? "lg:col-span-6" : ""} flex flex-col gap-6`}>
            {/* A. Resource Flow Engine (Money Module) */}
            <div 
              className="p-5 bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-2xl flex flex-col justify-between"
              style={{ 
                height: showSynapticGateway && visibleModules.Learning ? "420px" : "160px",
                borderColor: `color-mix(in srgb, var(--rank-accent) 10%, transparent)`,
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-850/60 pb-2 mb-2">
                <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-emerald-400" /> Resource Flow Engine
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Income</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Expense</span>
                </div>
              </div>

              <div className="w-full flex-1 mt-2">
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
          </div>
        )}

        {/* Right Column: Cognitive Synaptic Gateway & Skill Tree Tracker (col-span-12 lg:col-span-6) */}
        {visibleModules.Learning && (
          <div className={`col-span-12 ${visibleModules.Money ? "lg:col-span-6" : ""} flex flex-col gap-6`}>
            {showSynapticGateway && (
              <div 
                className="p-6 bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-2xl flex flex-col items-center justify-between h-[236px] transition-all duration-300"
                style={{ borderColor: `color-mix(in srgb, var(--rank-accent) 15%, transparent)`, boxShadow: `0 4px 20px color-mix(in srgb, var(--rank-accent) 3%, transparent)` }}
              >
                <div className="w-full flex items-center justify-between border-b border-slate-850/60 pb-3">
                  <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                    <Brain className="h-4 w-4 text-purple-400" /> Synaptic Gateway
                  </h3>
                  <span className="text-[9px] font-black tracking-widest uppercase bg-purple-950/80 border border-purple-800 text-purple-400 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(168,85,247,0.25)] animate-pulse">
                    ACTIVE
                  </span>
                </div>

                {/* Minimal circular data track */}
                <div className="relative flex items-center justify-center my-2">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Circle */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#0f172a" strokeWidth="8" />
                    {/* Progress Circle */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      stroke="var(--rank-accent)" 
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - (lastMainExamScore ?? 0) / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                      style={{ filter: `drop-shadow(0 0 4px var(--rank-accent))` }} 
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-black text-white leading-none font-mono">
                      {lastMainExamScore}%
                    </span>
                  </div>
                </div>

                {/* Underneath short text readout */}
                <div className="text-center w-full">
                  <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">
                    CURRENT SYNAPTIC WINDOW
                  </p>
                  <p className="text-xs font-bold text-slate-200 truncate mt-0.5 px-2" title={lastMainExamTitle ?? "Examination"}>
                    {lastMainExamTitle || "Main Exam"}
                  </p>
                </div>
              </div>
            )}

            {/* B. Skill Tree Tracker (Learning Module) */}
            <div 
              className="p-5 bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-2xl flex items-center justify-between"
              style={{ height: "160px" }}
            >
              <div className="w-1/2 flex flex-col justify-between h-full py-0.5">
                <div>
                  <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-indigo-400" /> Skill Matrix Hub
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Timer className="h-5 w-5 text-indigo-400 shrink-0" />
                    <span className="text-2xl font-black text-slate-100 tracking-wide leading-none">
                      {learningTelemetry.hours} <span className="text-xs text-slate-500 font-bold">HRS</span>
                    </span>
                  </div>
                </div>

                {/* Exam Alert Notification */}
                {learningTelemetry.closestExam ? (
                  <div className="flex items-center gap-2 text-red-405 bg-red-950/40 border border-red-900/60 p-2 rounded-xl animate-pulse mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                    <div className="overflow-hidden leading-tight">
                      <span className="text-[8px] font-black tracking-wider uppercase block text-red-100">CRITICAL WAR</span>
                      <span className="text-[8px] font-bold text-slate-350 truncate block">
                        {learningTelemetry.closestExam.title}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-555 bg-slate-955 border border-slate-850 p-1.5 rounded-xl mt-1">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[8px] font-bold uppercase tracking-wider">No active exam</span>
                  </div>
                )}
              </div>

              {/* Radial Loading Gauge */}
              <div className="w-28 h-28 relative flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="75%"
                    outerRadius="100%"
                    barSize={8}
                    data={studyProgressDetails.chartData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      background={{ fill: "#33415510" }}
                      dataKey="value"
                      cornerRadius={5}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-none mt-1">
                  <span className="text-[16px] font-black text-slate-100 font-mono">
                    {studyProgressDetails.revisionsPct}%
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {studyProgressDetails.completedRevisions} / {studyProgressDetails.totalRevisions}
                  </span>
                  <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    Subjects
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full-width Row: Kinetic Overdrive Matrix (col-span-12) */}
        {visibleModules.Workout && (
          <div className="col-span-12">
            {/* Kinetic Overdrive Matrix (compact full-width style) */}
            <div 
              className="p-5 bg-slate-900/40 backdrop-blur-md border border-slate-850 rounded-2xl flex flex-col justify-between transition-all duration-300"
              style={{ 
                height: "145px",
                borderColor: `color-mix(in srgb, var(--rank-accent) 12%, transparent)`, 
                boxShadow: `0 4px 20px color-mix(in srgb, var(--rank-accent) 2%, transparent)` 
              }}
            >
              <div className="w-full flex items-center justify-between border-b border-slate-850/60 pb-2 mb-2">
                <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                  <Dumbbell className="h-4 w-4 text-emerald-450" /> Kinetic Overdrive Matrix
                </h3>
                
                {/* Performance Title Evaluator */}
                <span 
                  className="text-[9px] font-black tracking-widest uppercase border px-2 py-0.5 rounded transition-all duration-300"
                  style={{ 
                    color: overallPerformance.color, 
                    borderColor: `${overallPerformance.color}30`, 
                    backgroundColor: `${overallPerformance.color}10`,
                    boxShadow: `0 0 8px ${overallPerformance.color}10`
                  }}
                >
                  {overallPerformance.label}
                </span>
              </div>

              {/* Anatomical & Brain Performance Tag Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 my-2">
                {[
                  { key: "brain", label: "Brain", isLucide: true, icon: <Brain className="h-4 w-4" />, score: Math.min(100, Math.round((learningTelemetry.hours / learningTelemetry.target) * 100)) },
                  { key: "chest", label: "Chest", icon: "chest.png", score: muscleGroupsProgress.chest ?? 0 },
                  { key: "shoulders", label: "Shoulders", icon: "shoulders.png", score: muscleGroupsProgress.shoulders ?? 0 },
                  { key: "abs", label: "Core", icon: "abs.png", score: muscleGroupsProgress.abs ?? 0 },
                  { key: "back", label: "Back", icon: "back.png", score: muscleGroupsProgress.back ?? 0 },
                  { key: "arms", label: "Arms", icon: "arms.png", score: muscleGroupsProgress.arms ?? 0 },
                  { key: "legs", label: "Legs", icon: "legs.png", score: muscleGroupsProgress.legs ?? 0 }
                ].map((item) => {
                  const score = item.score;
                  const status = getWorkoutStatus(score);
                  return (
                    <div 
                      key={item.key} 
                      className="flex items-center justify-between p-2 rounded-xl border bg-slate-955/45 transition-all duration-300 hover:border-slate-800"
                      style={{ borderColor: `color-mix(in srgb, ${status.color} 15%, transparent)` }}
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {item.isLucide ? (
                          <div style={{ color: status.color }} className="shrink-0">
                            {item.icon}
                          </div>
                        ) : (
                          <img 
                            src={`/assets/icons/${item.icon}`} 
                            alt={item.label} 
                            className="h-4 w-4 object-contain shrink-0" 
                            style={{ mixBlendMode: "screen" }}
                          />
                        )}
                        <span className="text-[10px] font-bold text-slate-355 truncate tracking-wide">{item.label}</span>
                      </div>
                      <span className="font-mono text-[10px] font-black shrink-0 ml-1" style={{ color: status.color }}>{score}%</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="text-[9px] text-slate-500 font-semibold text-center border-t border-slate-850/60 pt-2 shrink-0">
                Weekly Average Compliance: <span className="font-bold text-slate-355">{averageWeeklyCompliance}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOUNTY BOARD NODES (Tasks module Integration) */}
      {visibleModules.Tasks && (
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
                  className={`flex items-center gap-3 rounded-xl border p-3.5 bg-slate-955/45 cursor-pointer select-none active:scale-[0.98] transition-all hover:border-slate-700 ${task.completed ? "opacity-60 border-slate-900" : "border-slate-850"
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
      )}
    </section>
  );
}
