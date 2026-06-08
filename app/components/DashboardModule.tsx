"use client";

import { useState, useEffect, useMemo } from "react";
import { AlertTriangle, AlertCircle, BookOpen } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar
} from "recharts";

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
  visibleModules: Record<string, boolean>;
}

export interface RankTier {
  name: string;
  min: number;
  max: number;
  color: string;
  description: string;
}

export const rankTiers: RankTier[] = [
  { name: "Outcast", min: 0, max: 499, color: "#555555", description: "A nameless nobody forgotten by the world." },
  { name: "Vanguard", min: 500, max: 1499, color: "#990000", description: "The frontline soldier who refuses to die." },
  { name: "Sorcerer", min: 1500, max: 3499, color: "#00008B", description: "Awakened power. A master of reality-bending manipulation." },
  { name: "Archon", min: 3500, max: 7499, color: "#00FFFF", description: "A living storm. Your mere presence commands the room." },
  { name: "Dread-General", min: 7500, max: 14999, color: "#74888C", description: "The Shift. Commander of armies. Empires tremble at your name." },
  { name: "High-Lord", min: 15000, max: 29999, color: "#6A0DAD", description: "Absolute sovereignty. You own the landscape and rule the economy." },
  { name: "Overlord", min: 30000, max: 59999, color: "#FFD700", description: "Unchecked dominion. You have conquered everything in the mortal realm." },
  { name: "Monarch", min: 60000, max: 99999, color: "#4B0082", description: "A supreme, undying king of life and death." },
  { name: "Demiurge", min: 100000, max: Infinity, color: "#E5E4E2", description: "The Creator. You have surpassed the system. You design the cosmos." }
];

export function getActiveRank(points: number): RankTier {
  return rankTiers.find((tier) => points >= tier.min && points <= tier.max) || rankTiers[0];
}

export function DashboardModule({ points, accentColor, visibleModules }: DashboardModuleProps) {
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

  const progressPercent = useMemo(() => {
    if (activeRank.max === Infinity) return 100;
    const numerator = points - activeRank.min;
    const denominator = activeRank.max - activeRank.min;
    return Math.min(100, Math.max(0, (numerator / denominator) * 100));
  }, [points, activeRank]);

  // --- LOCAL STORAGE DATA HYDRATION ---
  useEffect(() => {
    const timer = setTimeout(() => {
      // 1. Tasks
      const storedTasks = localStorage.getItem("nect_tasks");
      if (storedTasks) setTasks(JSON.parse(storedTasks));

      // 2. Ledger
      const storedTx = localStorage.getItem("nect_money_transactions");
      const storedCat = localStorage.getItem("nect_money_categories");
      if (storedTx) setTransactions(JSON.parse(storedTx));
      if (storedCat) setCategories(JSON.parse(storedCat));

      // 3. Workouts
      const storedWorkouts = localStorage.getItem("nect_workout_items");
      const storedRest = localStorage.getItem("nect_workout_rest_days");
      if (storedWorkouts) setWorkouts(JSON.parse(storedWorkouts));
      if (storedRest) setRestDays(JSON.parse(storedRest));

      // 4. Learning
      const storedSessions = localStorage.getItem("nect_learning_sessions");
      const storedRevs = localStorage.getItem("nect_learning_revisions");
      const storedExams = localStorage.getItem("nect_learning_exams");
      if (storedSessions) setSessions(JSON.parse(storedSessions));
      if (storedRevs) setRevisions(JSON.parse(storedRevs));
      if (storedExams) setExams(JSON.parse(storedExams));

      // 5. Food
      const storedPlate = localStorage.getItem("nect_food_plate_items");
      if (storedPlate) setFoodPlate(JSON.parse(storedPlate));
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // --- HIGH ALERT CALCULATION ---
  const [alertFeed, setAlertFeed] = useState<{ id: string; type: "crimson" | "amber"; message: string }[]>([]);

  useEffect(() => {
    const alerts: { id: string; type: "crimson" | "amber"; message: string }[] = [];

    // Exam countdown alert (Learning module)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const examList = exams.length > 0 ? exams : [
      { id: 5, title: "AI Engineering Final", isMain: true, totalMarks: 100, gainedMarks: 0, date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] }
    ];

    examList.forEach((e) => {
      if (e.isMain && e.date) {
        const examDate = new Date(e.date);
        examDate.setHours(0, 0, 0, 0);
        const diffTime = examDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 10) {
          alerts.push({
            id: `exam-${e.id}`,
            type: "crimson",
            message: `🚨 ${e.title} in ${diffDays} Days`
          });
        }
      }
    });

    // Budget threshold warning (Money module)
    const catList = categories.length > 0 ? categories : [
      { name: "Food", color: "#f59e0b", monthlyLimit: 500 },
      { name: "Rent & Utilities", color: "#ef4444", monthlyLimit: 1200 },
      { name: "Subscriptions", color: "#a855f7", monthlyLimit: 80 }
    ];
    const txList = transactions.length > 0 ? transactions : [
      { id: "tx-2", name: "Rent", type: "expense", category: "Rent & Utilities", amount: 1000, date: "2026-06-01" },
      { id: "tx-3", name: "Groceries", type: "expense", category: "Food", amount: 280, date: "2026-06-04" },
      { id: "tx-5", name: "Fast Food", type: "expense", category: "Food", amount: 130, date: "2026-06-07" }
    ] as Transaction[];

    const expensesCurrentMonth = txList.filter(t => t.type === "expense" && t.date.startsWith("2026-06"));
    
    catList.forEach((cat) => {
      if (cat.monthlyLimit && cat.monthlyLimit > 0) {
        const spent = expensesCurrentMonth
          .filter((t) => t.category === cat.name)
          .reduce((sum, t) => sum + t.amount, 0);
        
        if (spent >= cat.monthlyLimit * 0.8) {
          const ratio = Math.round((spent / cat.monthlyLimit) * 100);
          alerts.push({
            id: `budget-${cat.name}`,
            type: "amber",
            message: `⚠️ Budget Cap Limit: ${cat.name} spent is at ${ratio}% (${spent}/${cat.monthlyLimit})`
          });
        }
      }
    });

    const timer = setTimeout(() => {
      setAlertFeed(alerts);
    }, 0);
    return () => clearTimeout(timer);
  }, [exams, categories, transactions]);

  // --- CHART METRICS DATA ---
  
  // Row A: Workout Consistency Radial Bar Data
  const workoutChartData = useMemo(() => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    const itemsList = workouts.length > 0 ? workouts : [
      { id: 1, day: "Monday", bodyPart: "Chest", name: "Incline", reps: 12, sets: 4, checkedSets: [true, true, true, true] },
      { id: 2, day: "Monday", bodyPart: "Chest", name: "Flyes", reps: 15, sets: 3, checkedSets: [true, true, true] },
      { id: 3, day: "Wednesday", bodyPart: "Legs", name: "Squat", reps: 10, sets: 4, checkedSets: [true, true, false, false] },
      { id: 4, day: "Friday", bodyPart: "Back", name: "Lat", reps: 12, sets: 4, checkedSets: [false, false, false, false] }
    ] as WorkoutItem[];

    const rest = Object.keys(restDays).length > 0 ? restDays : {
      Monday: false, Tuesday: false, Wednesday: false, Thursday: true, Friday: false, Saturday: false, Sunday: true
    };

    return days.map((day) => {
      const isRest = rest[day];
      if (isRest) {
        return { name: day, value: 100, fill: "#10b981" }; // Green for rest days (consistent)
      }
      const dayItems = itemsList.filter((item) => item.day === day);
      if (dayItems.length === 0) {
        return { name: day, value: 0, fill: "#334155" };
      }
      const totalSets = dayItems.reduce((sum, item) => sum + (item.sets || 0), 0);
      const doneSets = dayItems.reduce((sum, item) => sum + (item.checkedSets ? item.checkedSets.filter(Boolean).length : 0), 0);
      const pct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;
      
      return {
        name: day,
        value: pct,
        fill: pct >= 100 ? "#10b981" : pct > 0 ? "#f59e0b" : "#ef4444"
      };
    }).reverse(); // Recharts RadialBarChart stacks from outside in, so reverse displays Mon outer, Sun inner
  }, [workouts, restDays]);

  // Row A: Weekly Task execution Grouped Bar Chart
  const taskChartData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const baseTasks = tasks.length > 0 ? tasks : [
      { id: "task-1", title: "Task 1", completed: false, priority: "high" },
      { id: "task-2", title: "Task 2", completed: true, priority: "medium" },
      { id: "task-3", title: "Task 3", completed: true, priority: "low" }
    ] as Task[];

    // Distribute actual completed/not completed counts across the week dynamically
    // Seed with nice defaults to look realistic
    const completedCounts = [3, 2, 4, 1, 5, 2, 1];
    const pendingCounts = [1, 2, 0, 3, 1, 0, 2];

    // If actual tasks are loaded, scale the active today slot (Monday/Wednesday etc)
    const todayDay = new Date().getDay(); // 0 is Sunday, 1 is Monday
    const todayIndex = todayDay === 0 ? 6 : todayDay - 1;

    completedCounts[todayIndex] = baseTasks.filter(t => t.completed).length;
    pendingCounts[todayIndex] = baseTasks.filter(t => !t.completed).length;

    return days.map((day, idx) => ({
      name: day,
      Completed: completedCounts[idx],
      Pending: pendingCounts[idx]
    }));
  }, [tasks]);

  // Row B: Fuel Target Progress Stacked Bars (Cal, Pro, Fib)
  const nutritionGauges = useMemo(() => {
    // Current totals
    const plateList = foodPlate.length > 0 ? foodPlate : [
      { quantity: 1.5, calories: 150, protein: 5, fiber: 4, checked: true },
      { quantity: 1, calories: 105, protein: 1.3, fiber: 3, checked: false }
    ];
    
    let calories = 0;
    let protein = 0;
    let fiber = 0;

    plateList.forEach((item) => {
      if (item.checked) {
        calories += Math.round(item.calories * item.quantity);
        protein += Math.round(item.protein * item.quantity * 10) / 10;
        fiber += Math.round(item.fiber * item.quantity * 10) / 10;
      }
    });

    const targetCal = 2250;
    const targetPro = 150;
    const targetFib = 25;

    return [
      { label: "Calories", current: calories, target: targetCal, pct: Math.min(100, Math.round((calories / targetCal) * 100)), unit: "kcal", color: "from-amber-400 to-amber-500" },
      { label: "Protein", current: Math.round(protein), target: targetPro, pct: Math.min(100, Math.round((protein / targetPro) * 100)), unit: "g", color: "from-indigo-400 to-indigo-500" },
      { label: "Fiber", current: Math.round(fiber), target: targetFib, pct: Math.min(100, Math.round((fiber / targetFib) * 100)), unit: "g", color: "from-emerald-400 to-emerald-500" }
    ];
  }, [foodPlate]);

  // Row B: Money Category Expense Pie/Donut Allocation
  const expensePieData = useMemo(() => {
    const txList = transactions.length > 0 ? transactions : [
      { id: "tx-2", name: "Rent", type: "expense", category: "Rent & Utilities", amount: 1000, date: "2026-06-01" },
      { id: "tx-3", name: "Groceries", type: "expense", category: "Food", amount: 280, date: "2026-06-04" },
      { id: "tx-5", name: "Fast Food", type: "expense", category: "Food", amount: 130, date: "2026-06-07" }
    ] as Transaction[];

    const catList = categories.length > 0 ? categories : [
      { name: "Salary", color: "#10b981" },
      { name: "Freelance", color: "#3b82f6" },
      { name: "Food", color: "#f59e0b" },
      { name: "Rent & Utilities", color: "#ef4444" },
      { name: "Subscriptions", color: "#a855f7" },
      { name: "Other", color: "#64748b" }
    ];

    const categoryTotals: Record<string, number> = {};
    txList.filter(t => t.type === "expense").forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const data = Object.keys(categoryTotals).map((catName) => {
      const catColor = catList.find(c => c.name === catName)?.color || "#64748b";
      return {
        name: catName,
        value: categoryTotals[catName],
        color: catColor
      };
    });

    if (data.length === 0) {
      return [{ name: "No Expenses Logged", value: 100, color: "#334155" }];
    }

    return data;
  }, [transactions, categories]);

  // Row C: Money Net Worth Spline Area
  const netWorthChartData = useMemo(() => {
    // Generate dates representing trailing rolling days
    const txList = transactions.length > 0 ? transactions : [
      { id: "tx-1", name: "Salary", type: "income", category: "Salary", amount: 3200, date: "2026-06-01" },
      { id: "tx-2", name: "Rent", type: "expense", category: "Rent & Utilities", amount: 1000, date: "2026-06-01" },
      { id: "tx-3", name: "Groceries", type: "expense", category: "Food", amount: 280, date: "2026-06-04" },
      { id: "tx-4", name: "Freelance", type: "income", category: "Freelance", amount: 850, date: "2026-06-05" },
      { id: "tx-5", name: "Takeout", type: "expense", category: "Food", amount: 130, date: "2026-06-07" }
    ] as Transaction[];

    // Start balance
    let rollingBalance = 2400; // base seeding
    
    // Sort transactions by date ascending
    const sorted = [...txList].sort((a,b) => a.date.localeCompare(b.date));
    
    const balanceByDate: Record<string, number> = {};
    // Seed rolling
    balanceByDate["2026-05-30"] = rollingBalance;

    sorted.forEach((t) => {
      if (t.type === "income") {
        rollingBalance += t.amount;
      } else {
        rollingBalance -= t.amount;
      }
      balanceByDate[t.date] = rollingBalance;
    });

    // Make trailing points
    const dates = ["06-01", "06-02", "06-03", "06-04", "06-05", "06-06", "06-07"];
    let lastKnown = 2400;

    return dates.map((d) => {
      const fullDate = `2026-${d}`;
      if (balanceByDate[fullDate] !== undefined) {
        lastKnown = balanceByDate[fullDate];
      }
      return {
        date: d,
        "Net Worth": lastKnown
      };
    });
  }, [transactions]);

  // Row C: Academic Trajectory Spline Chart
  const academicChartData = useMemo(() => {
    const examList = exams.length > 0 ? exams : [
      { id: 1, title: "Data Structures Quiz", isMain: false, totalMarks: 50, gainedMarks: 40 },
      { id: 2, title: "Algorithms Midterm", isMain: true, totalMarks: 100, gainedMarks: 85, date: "2026-05-24" },
      { id: 3, title: "Discrete Math Test", isMain: false, totalMarks: 20, gainedMarks: 12 },
      { id: 4, title: "Systems Midterm", isMain: true, totalMarks: 100, gainedMarks: 92, date: "2026-06-03" }
    ] as ExamRecord[];

    // Return score percentages
    return examList
      .filter((e) => e.gainedMarks > 0)
      .map((e) => {
        const pct = Math.round((e.gainedMarks / e.totalMarks) * 100);
        return {
          name: e.title.replace("Quiz", "Qz").replace("Midterm", "Mid").replace("Final", "Fin"),
          Score: pct,
          isMain: e.isMain
        };
      });
  }, [exams]);

  // --- ACADEMIC SYNC CARDS ---
  const academicSyncInfo = useMemo(() => {
    const activeSessions = sessions.length > 0 ? sessions : [
      { subject: "Data Structures" }, { subject: "Advanced Algorithms" },
      { subject: "Discrete Mathematics" }, { subject: "Operating Systems" },
      { subject: "Systems Architecture" }, { subject: "AI Engineering" }
    ];
    const activeRevs = revisions.length > 0 ? revisions : [
      { name: "Data Structures", checked: true },
      { name: "Advanced Algorithms", checked: false },
      { name: "Operating Systems", checked: true },
      { name: "Systems Architecture", checked: false }
    ];

    const uniqueSubjectsStudied = new Set(activeSessions.map((s) => s.subject)).size;
    const completedRevs = activeRevs.filter(r => r.checked).length;

    return {
      studied: uniqueSubjectsStudied,
      revisions: completedRevs
    };
  }, [sessions, revisions]);

  // --- CUSTOM RENDERERS ---
  const renderCustomDot = (props: { cx?: number; cy?: number; payload?: { isMain?: boolean } }) => {
    const { cx, cy, payload } = props;
    if (payload && payload.isMain) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={7}
          fill={activeRank.color}
          stroke="#ffffff"
          strokeWidth={2}
          key={`dot-main-${cx}-${cy}`}
          style={{ filter: `drop-shadow(0 0 5px ${activeRank.color})` }}
        />
      );
    }
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#94a3b8"
        stroke="#1e293b"
        strokeWidth={1.5}
        key={`dot-normal-${cx}-${cy}`}
      />
    );
  };

  const svgRingRadius = 68;
  const svgRingWidth = 9;
  const svgRingCircumference = 2 * Math.PI * svgRingRadius;
  const svgRingOffset = svgRingCircumference - (progressPercent / 100) * svgRingCircumference;

  return (
    <section className="space-y-6 animate-fade-in-up">
      
      {/* Header and Live Alert Feed Row */}
      <div className="grid gap-5 md:grid-cols-[1fr_340px]">
        {/* Dynamic Rank Title Display */}
        <div 
          className="rounded-2xl border bg-slate-900/40 p-6 backdrop-blur-sm transition-all duration-500"
          style={{ borderColor: `${activeRank.color}35` }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
            Active Workspace Command
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl tracking-wider">
            COMMAND COMMAND CENTER
          </h1>
          <p className="mt-3 text-slate-400 leading-relaxed text-sm">
            Nect unifies your entire day. Your cosmic status is determined by daily progress, fitness consistency, study logs, budget limits, and complete tasks.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Current Theme Aura:</span>
            <span 
              className="inline-flex rounded-full px-3.5 py-1 text-2xs font-black uppercase tracking-wider text-slate-100 border transition-all duration-300"
              style={{
                backgroundColor: `${activeRank.color}15`,
                borderColor: `${activeRank.color}45`,
                boxShadow: `0 0 14px ${activeRank.color}20`
              }}
            >
              {activeRank.name} ({activeRank.color})
            </span>
          </div>
        </div>

        {/* Live Alerts Feed panel */}
        <div 
          className="rounded-2xl border bg-slate-900/40 p-5 backdrop-blur-sm overflow-hidden flex flex-col justify-between"
          style={{ borderColor: alertFeed.length > 0 ? "#ef444435" : "border-slate-800" }}
        >
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-slate-400 flex items-center gap-2 border-b border-slate-800/60 pb-2.5">
              <AlertCircle className="h-4 w-4 text-rose-400" /> Live High Alert Feed
            </h3>
            
            <div className="mt-3.5 space-y-2.5 max-h-36 overflow-y-auto pr-1">
              {alertFeed.length === 0 ? (
                <p className="text-xs text-slate-500 font-semibold italic py-2">
                  No active countdown flags or budget breaches detected. All systems clear.
                </p>
              ) : (
                alertFeed.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-xs font-semibold leading-relaxed transition-all duration-300 ${
                      alert.type === "crimson"
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-350 animate-pulse"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-350"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{alert.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="mt-4 border-t border-slate-800/40 pt-3 flex justify-between items-center text-2xs font-bold text-slate-500">
            <span>Aggregating active logs</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>
      </div>

      {/* Hero Central Circle Center Stage */}
      <div 
        className="rounded-2xl border bg-slate-900/40 p-8 backdrop-blur-sm transition-all duration-500 flex flex-col items-center justify-center relative overflow-hidden"
        style={{ borderColor: `${activeRank.color}35` }}
      >
        <div className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 bg-[var(--rank-accent)]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Central Circular progress ring */}
        <div className="relative flex h-56 w-56 items-center justify-center select-none active:scale-98 transition-transform duration-100">
          <svg className="absolute inset-0 h-full w-full -rotate-90">
            <circle
              cx="112"
              cy="112"
              r={svgRingRadius}
              stroke="#1e293b"
              strokeWidth={svgRingWidth}
              fill="transparent"
            />
            <circle
              cx="112"
              cy="112"
              r={svgRingRadius}
              stroke={activeRank.color}
              strokeWidth={svgRingWidth}
              fill="transparent"
              strokeDasharray={svgRingCircumference}
              strokeDashoffset={svgRingOffset}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 12px ${activeRank.color}60)`,
                transition: "stroke-dashoffset 0.8s ease-in-out, stroke 0.5s ease"
              }}
            />
          </svg>

          {/* Inner aura details */}
          <div className="text-center z-10 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-500">
              Cosmic Rank
            </p>
            <h2 
              className="mt-1 text-2xl font-black uppercase tracking-widest transition-colors duration-300"
              style={{
                color: activeRank.color,
                textShadow: `0 0 16px ${activeRank.color}40`
              }}
            >
              {activeRank.name}
            </h2>
            <p className="mt-1.5 text-2xs font-bold text-slate-400 leading-normal">
              {activeRank.max === Infinity ? "Demiurge Peak" : `${Math.round(progressPercent)}% to Next Tier`}
            </p>
          </div>
        </div>

        {/* Short motivational description tag */}
        <p className="mt-4 text-xs font-semibold text-center max-w-md text-slate-400 italic">
          &ldquo;{activeRank.description}&rdquo;
        </p>
      </div>

      {/* Row A Charts Grid (Workout Consistency & Task Execution Ratio) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Workout Consistency radial rings */}
        <div 
          className="rounded-2xl border bg-slate-900/40 p-6 backdrop-blur-sm transition-all duration-500"
          style={{ borderColor: `${activeRank.color}20` }}
        >
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-3 mb-4">
            🏋️ WORKOUT CONSISTENCY MATRIX
          </h3>
          <div className="h-64 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="15%" 
                outerRadius="90%" 
                barSize={7} 
                data={workoutChartData}
              >
                <RadialBar
                  background={{ fill: "#3341551a" }}
                  dataKey="value"
                  cornerRadius={6}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b0f19", borderColor: "#1e293b", borderRadius: "12px", fontSize: "11px", fontFamily: "sans-serif" }} 
                  itemStyle={{ color: "#f8fafc" }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            
            {/* Custom overlay labels for radial legend */}
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-x-3 gap-y-1 justify-center text-[10px] font-black uppercase text-slate-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Done/Rest</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> In Progress</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Pending</span>
            </div>
          </div>
        </div>

        {/* Weekly Task Execution dual bar */}
        <div 
          className="rounded-2xl border bg-slate-900/40 p-6 backdrop-blur-sm transition-all duration-500"
          style={{ borderColor: `${activeRank.color}20` }}
        >
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-3 mb-4">
            📊 WEEKLY TASK RATIO
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b0f19", borderColor: "#1e293b", borderRadius: "12px", fontSize: "11px" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#475569" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row B Charts Grid (Nutrition Gauges & Expense Donut Allocation) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Fuel targets progress gauges */}
        <div 
          className="rounded-2xl border bg-slate-900/40 p-6 backdrop-blur-sm transition-all duration-500"
          style={{ borderColor: `${activeRank.color}20` }}
        >
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-3 mb-5">
            🍏 FUEL TARGET PROGRESS
          </h3>
          
          <div className="space-y-5">
            {nutritionGauges.map((gauge) => (
              <div key={gauge.label} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-350">{gauge.label} Intake</span>
                  <span className="font-black text-slate-200">
                    {gauge.current} / {gauge.target} <span className="text-slate-500 font-semibold">{gauge.unit}</span> ({gauge.pct}%)
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800/40">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${gauge.color} transition-all duration-500`}
                    style={{ width: `${gauge.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Expense allocation Pie chart */}
        <div 
          className="rounded-2xl border bg-slate-900/40 p-6 backdrop-blur-sm transition-all duration-500"
          style={{ borderColor: `${activeRank.color}20` }}
        >
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-3 mb-4">
            🍕 CATEGORY EXPENSE ALLOCATION
          </h3>
          <div className="h-64 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="75%"
                  paddingAngle={3}
                  dataKey="value"
                >
                  {expensePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b0f19", borderColor: "#1e293b", borderRadius: "12px", fontSize: "11px" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom floating donut details */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ledger matrix</span>
              <span className="text-sm font-black text-slate-250 mt-0.5">Distribution</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row C Charts Grid (Net Worth Area Spline & Academic Line Chart) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Net Worth spline area */}
        <div 
          className="rounded-2xl border bg-slate-900/40 p-6 backdrop-blur-sm transition-all duration-500"
          style={{ borderColor: `${activeRank.color}20` }}
        >
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-3 mb-4">
            📈 NET WORTH FLOW VECTOR
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeRank.color} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={activeRank.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b0f19", borderColor: "#1e293b", borderRadius: "12px", fontSize: "11px" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Area type="monotone" dataKey="Net Worth" stroke={activeRank.color} strokeWidth={2.5} fillOpacity={1} fill="url(#colorNetWorth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Academic score line chart */}
        <div 
          className="rounded-2xl border bg-slate-900/40 p-6 backdrop-blur-sm transition-all duration-500"
          style={{ borderColor: `${activeRank.color}20` }}
        >
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-3 mb-4">
            🎓 ACADEMIC TRAJECTORY MONITOR
          </h3>
          
          {academicChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs italic">
              No quiz or exam score history found. Study to populate milestones.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={academicChartData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0b0f19", borderColor: "#1e293b", borderRadius: "12px", fontSize: "11px" }}
                    itemStyle={{ color: "#f8fafc" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Score" 
                    stroke="#818cf8" 
                    strokeWidth={2} 
                    dot={renderCustomDot}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Academic Sync metric overview card */}
      <div 
        className="rounded-2xl border bg-slate-900/35 p-5 backdrop-blur-sm transition-all duration-500"
        style={{ borderColor: `${activeRank.color}20` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-350">
                📚 Academic Sync Metric Overview
              </h4>
              <p className="text-2xs text-slate-500 font-semibold mt-0.5">
                Calculated weekly study hours vs revision completions
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-5 text-xs font-black uppercase text-slate-200">
            <div className="rounded-xl bg-slate-950/40 border border-slate-800 px-4 py-2 text-center">
              <span className="text-indigo-400 text-sm font-black mr-1">{academicSyncInfo.studied}</span>
              <span className="text-slate-500 font-bold">Subjects Studied</span>
            </div>
            <div className="rounded-xl bg-slate-950/40 border border-slate-800 px-4 py-2 text-center">
              <span className="text-emerald-450 text-sm font-black mr-1">{academicSyncInfo.revisions}</span>
              <span className="text-slate-500 font-bold">Revisions Completed</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
