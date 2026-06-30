"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState, useEffect } from "react";
import { Flame, Hourglass, Layers, Milestone, Scale, Ruler, Activity, User, Check, Moon, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useNectStore } from "../store/useNectStore";
import { FireStreak } from "./FireStreak";
import { PowerUpBoost } from "./PowerUpBoost";

type DayName =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type WorkoutItem = {
  id: number;
  day: DayName;
  bodyPart: string;
  name: string;
  reps: number;
  sets: number;
  checkedSets: boolean[];
  completed?: boolean;
};

const days: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const initialWorkoutItems: WorkoutItem[] = [
  {
    id: 1,
    day: "Monday",
    bodyPart: "Chest",
    name: "Incline Dumbbell Press",
    reps: 12,
    sets: 4,
    checkedSets: [false, false, false, false],
  },
  {
    id: 2,
    day: "Monday",
    bodyPart: "Chest",
    name: "Cable Chest Flyes",
    reps: 15,
    sets: 3,
    checkedSets: [false, false, false],
  },
  {
    id: 3,
    day: "Wednesday",
    bodyPart: "Legs",
    name: "Goblet Squat",
    reps: 10,
    sets: 4,
    checkedSets: [false, false, false, false],
  },
  {
    id: 4,
    day: "Friday",
    bodyPart: "Back",
    name: "Lat Pulldown",
    reps: 12,
    sets: 4,
    checkedSets: [false, false, false, false],
  },
  {
    id: 5,
    day: "Tuesday",
    bodyPart: "Shoulders",
    name: "Overhead Dumbbell Press",
    reps: 10,
    sets: 4,
    checkedSets: [false, false, false, false],
  },
];

const dayIndex = new Date().getDay();
const todayName = days[dayIndex === 0 ? 6 : dayIndex - 1];

const fieldClass =
  "rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500";

const bodyPartIcons: Record<string, string> = {
  chest: "/assets/icons/chest.png",
  legs: "/assets/icons/legs.png",
  back: "/assets/icons/back.png",
  abs: "/assets/icons/abs.png",
  core: "/assets/icons/abs.png",
  arms: "/assets/icons/arms.png",
  shoulders: "/assets/icons/shoulders.png",
};

const getBodyPartIcon = (part: string) => {
  const normalized = part.toLowerCase();
  return bodyPartIcons[normalized] || "/assets/icons/exercise.png";
};

const isWorkoutCompleted = (item: WorkoutItem) => {
  if (item.completed !== undefined) {
    return item.completed;
  }
  return item.checkedSets ? item.checkedSets.every(Boolean) : false;
};

export function ExerciseModule({
  weight: propWeight,
  setWeight: propSetWeight,
  height: propHeight,
  setHeight: propSetHeight,
  age: propAge,
  setAge: propSetAge,
  dob: propDob,
  setDob: propSetDob,
  biologicalSex: propSex,
  setBiologicalSex: propSetSex,
  activityMultiplier: propActivity,
  setActivityMultiplier: propSetActivity,
  proteinActivityFactor: propProteinFactor,
  setProteinActivityFactor: propSetProteinFactor,
}: {
  weight?: number;
  setWeight?: (w: number) => void;
  height?: number;
  setHeight?: (h: number) => void;
  age?: number;
  setAge?: (a: number) => void;
  dob?: string;
  setDob?: (d: string) => void;
  biologicalSex?: "Men" | "Women";
  setBiologicalSex?: (s: "Men" | "Women") => void;
  activityMultiplier?: "Sedentary" | "Lightly Active" | "Moderately Active" | "Very Active";
  setActivityMultiplier?: (m: "Sedentary" | "Lightly Active" | "Moderately Active" | "Very Active") => void;
  proteinActivityFactor?: "Sedentary" | "Active" | "Strength";
  setProteinActivityFactor?: (f: "Sedentary" | "Active" | "Strength") => void;
} = {}) {
  const [activeView, setActiveView] = useState<"today" | "weekly" | "profile" | "sports">("today");
  const [selectedDay, setSelectedDay] = useState<DayName>(todayName);
  const [restDays, setRestDays] = useState<Record<DayName, boolean>>({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: true,
    Friday: false,
    Saturday: false,
    Sunday: true,
  });
  const [workoutItems, setWorkoutItems] = useState(initialWorkoutItems);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sleepLogs, setSleepLogs] = useState<any[]>([]);
  const [sportsList, setSportsList] = useState<any[]>([]);

  // Zustand state
  const {
    powerStreak,
    incrementPowerStreak,
    decayPowerStreak,
    awardPoints,
  } = useNectStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedWorkouts = localStorage.getItem("nect_workout_items");
      const storedRest = localStorage.getItem("nect_workout_rest_days");
      const storedLogs = localStorage.getItem("nect_workout_sleep_logs");
      const storedSports = localStorage.getItem("nect_workout_sports_list");
      if (storedWorkouts) {
        let parsed = JSON.parse(storedWorkouts);
        const getStartOfWeek = () => {
          const now = new Date();
          const day = now.getDay();
          const diff = now.getDate() - day;
          const sunday = new Date(now.setDate(diff));
          sunday.setHours(0, 0, 0, 0);
          return sunday.getTime();
        };
        const lastReset = localStorage.getItem("nect_workout_last_reset_week");
        const currentWeekStart = getStartOfWeek();
        if (!lastReset || parseInt(lastReset) < currentWeekStart) {
          parsed = parsed.map((item: any) => ({
            ...item,
            checkedSets: item.checkedSets ? item.checkedSets.map(() => false) : Array.from({ length: item.sets || 3 }, () => false),
            completed: false
          }));
          localStorage.setItem("nect_workout_items", JSON.stringify(parsed));
          localStorage.setItem("nect_workout_last_reset_week", currentWeekStart.toString());
        }
        setWorkoutItems(parsed);
      }
      if (storedRest) setRestDays(JSON.parse(storedRest));
      if (storedLogs) {
        try {
          setSleepLogs(JSON.parse(storedLogs));
        } catch (e) {
          console.error(e);
        }
      }
      if (storedSports) {
        try {
          setSportsList(JSON.parse(storedSports));
        } catch (e) {
          console.error(e);
        }
      }
      setIsLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("nect_workout_items", JSON.stringify(workoutItems));
  }, [workoutItems, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("nect_workout_rest_days", JSON.stringify(restDays));
  }, [restDays, isLoaded]);

  const [bodyPart, setBodyPart] = useState("Chest");
  const [exerciseName, setExerciseName] = useState("");
  const [reps, setReps] = useState(12);
  const [sets, setSets] = useState(3);
  const [internalWeight, setInternalWeight] = useState(75);
  const [internalHeight, setInternalHeight] = useState(180);
  const [internalAge, setInternalAge] = useState(25);
  const [internalDob, setInternalDob] = useState("");
  const [internalSex, setInternalSex] = useState<"Men" | "Women">("Men");
  const [internalActivity, setInternalActivity] = useState<"Sedentary" | "Lightly Active" | "Moderately Active" | "Very Active">("Moderately Active");
  const [internalProteinFactor, setInternalProteinFactor] = useState<"Sedentary" | "Active" | "Strength">("Strength");

  const weight = propWeight !== undefined ? propWeight : internalWeight;
  const setWeight = propSetWeight !== undefined ? propSetWeight : setInternalWeight;
  const height = propHeight !== undefined ? propHeight : internalHeight;
  const setHeight = propSetHeight !== undefined ? propSetHeight : setInternalHeight;
  const age = propAge !== undefined ? propAge : internalAge;
  const setAge = propSetAge !== undefined ? propSetAge : setInternalAge;
  const dob = propDob !== undefined ? propDob : internalDob;
  const setDob = propSetDob !== undefined ? propSetDob : setInternalDob;
  const biologicalSex = propSex !== undefined ? propSex : internalSex;
  const setBiologicalSex = propSetSex !== undefined ? propSetSex : setInternalSex;
  const activityMultiplier = propActivity !== undefined ? propActivity : internalActivity;
  const setActivityMultiplier = propSetActivity !== undefined ? propSetActivity : setInternalActivity;
  const proteinActivityFactor = propProteinFactor !== undefined ? propProteinFactor : internalProteinFactor;
  const setProteinActivityFactor = propSetProteinFactor !== undefined ? propSetProteinFactor : setInternalProteinFactor;

  const [rewardedDays, setRewardedDays] = useState<DayName[]>([]);
  const [notification, setNotification] = useState("");

  const todaysItems = workoutItems.filter((item) => item.day === todayName);
  const isTodayRest = restDays[todayName];
  const bmi = height > 0 ? weight / (height / 100) ** 2 : 0;
  const bmiMeta = getBmiMeta(bmi);

  const calculatedSleepDuration = useMemo(() => {
    if (sleepLogs.length === 0) return null;
    const sorted = [...sleepLogs].sort((a, b) => b.timestamp - a.timestamp);
    const latest = sorted[0];
    if (!latest || !latest.timestamp) return null;

    // Check if the log is older than 24 hours
    const ageMs = Date.now() - latest.timestamp;
    if (ageMs > 24 * 60 * 60 * 1000) {
      return null;
    }

    const sleepTotal = latest.sleepHour * 60 + latest.sleepMin;
    const wakeTotal = latest.wakeHour * 60 + latest.wakeMin;

    let diffMinutes = 0;
    if (wakeTotal >= sleepTotal) {
      diffMinutes = wakeTotal - sleepTotal;
    } else {
      diffMinutes = (24 * 60 - sleepTotal) + wakeTotal;
    }

    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return `${hours}h ${mins}m`;
  }, [sleepLogs]);

  const todaysSports = useMemo(() => {
    const targetDateStr = getWeekdayDateInCurrentWeek(todayName);

    return sportsList.filter((sport) => {
      if (sport.day !== todayName) return false;
      if (sport.repeatWeekly) return true;
      return sport.dateLogged === targetDateStr;
    });
  }, [sportsList, todayName]);

  const handleToggleSportCompleted = (id: number) => {
    const todayDateStr = new Date().toISOString().split("T")[0];
    const updated = sportsList.map((sport) => {
      if (sport.id !== id) return sport;

      if (sport.repeatWeekly) {
        const isCurrentlyCompleted = sport.lastCompletedDate === todayDateStr;
        return {
          ...sport,
          lastCompletedDate: isCurrentlyCompleted ? "" : todayDateStr,
        };
      } else {
        return {
          ...sport,
          completed: !sport.completed,
        };
      }
    });

    setSportsList(updated);
    localStorage.setItem("nect_workout_sports_list", JSON.stringify(updated));
  };

  const daySummaries = useMemo(
    () =>
      days.map((day) => {
        const items = workoutItems.filter((item) => item.day === day);
        const parts = Array.from(new Set(items.map((item) => item.bodyPart)));

        return {
          day,
          label: restDays[day] ? "Rest Interval" : parts.join(" + ") || "Open Slot",
        };
      }),
    [restDays, workoutItems],
  );

  function addWorkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setRestDays((current) => ({ ...current, [selectedDay]: false }));
    setWorkoutItems((current) => [
      ...current,
      {
        id: Date.now(),
        day: selectedDay,
        bodyPart,
        name: exerciseName,
        reps,
        sets,
        checkedSets: Array.from({ length: sets }, () => false),
      },
    ]);
    setExerciseName("");
    setNotification(`${exerciseName} added to ${selectedDay}.`);
  }

  function deleteWorkout(id: number) {
    setWorkoutItems((current) => current.filter((item) => item.id !== id));
  }

  function toggleRestDay(day: DayName, isRest: boolean) {
    setRestDays((current) => ({ ...current, [day]: isRest }));
    setNotification(
      isRest
        ? `${day} is now a protected rest interval.`
        : `${day} is back on active workout rotation.`,
    );
  }

  function toggleWorkoutCompleted(itemId: number) {
    let dayCompleted = false;
    let wasChecked = false;

    workoutItems.forEach((item) => {
      if (item.id === itemId) {
        wasChecked = isWorkoutCompleted(item);
      }
    });

    setWorkoutItems((current) => {
      const next = current.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const isCompletedNow = !isWorkoutCompleted(item);
        const checkedSets = item.checkedSets ? item.checkedSets.map(() => isCompletedNow) : Array.from({ length: item.sets }, () => isCompletedNow);

        return { ...item, completed: isCompletedNow, checkedSets };
      });

      dayCompleted =
        next.filter((item) => item.day === todayName).length > 0 &&
        next
          .filter((item) => item.day === todayName)
          .every((item) => isWorkoutCompleted(item));

      return next;
    });

    if (!wasChecked) {
      awardPoints(50, "Workout"); // Award 50 XP for completing a workout movement
    }

    if (dayCompleted && !rewardedDays.includes(todayName)) {
      setRewardedDays((current) => [...current, todayName]);
      incrementPowerStreak();
      awardPoints(150, "Workout"); // +150 XP for completing the workout day
    }
  }


  return (
    <section className="space-y-6 animate-fade-in-up">
      {/* Top Panel (Main Panel) */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center md:items-start text-center md:text-left shrink-0">
              <h1 className="text-3xl font-black text-white uppercase tracking-wider">
                Training Hub
              </h1>
              <span className="text-[10px] font-black tracking-[0.2em] text-[var(--rank-accent)] mt-1.5 uppercase">
                Enter the grind
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Telemetry / Status Row */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-slate-800/80">
          {/* Streak Indicator */}
          <div className="relative flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/50 overflow-hidden">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center shrink-0">
              <Flame className="h-5 w-5 animate-pulse" style={{ color: "var(--rank-accent)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Power Streak</p>
                {calculatedSleepDuration && (
                  <span className="inline-flex items-center gap-1 rounded bg-indigo-950/50 border border-indigo-500/30 px-1.5 py-0.5 text-[9px] font-black text-indigo-300 shrink-0">
                    <Moon className="h-2.5 w-2.5 text-indigo-400" />
                    <span>{calculatedSleepDuration}</span>
                  </span>
                )}
              </div>
              <p className="text-sm font-black text-white mt-0.5">{powerStreak} Days</p>
            </div>
          </div>

          {/* Weight Indicator */}
          <div className="flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/50">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center">
              <Scale className="h-5 w-5" style={{ color: "var(--rank-accent)" }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Weight</p>
              <p className="text-sm font-black text-white">{weight} kg</p>
            </div>
          </div>

          {/* Height Indicator */}
          <div className="flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/50">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center">
              <Ruler className="h-5 w-5" style={{ color: "var(--rank-accent)" }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Height</p>
              <p className="text-sm font-black text-white">{height} cm</p>
            </div>
          </div>

          {/* BMI Result Indicator */}
          <div className="flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/50">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center">
              <Activity className="h-5 w-5" style={{ color: "var(--rank-accent)" }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">BMI Result</p>
              <p className="text-sm font-black text-white flex items-center gap-1.5 flex-wrap">
                <span>{bmi.toFixed(1)}</span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${bmiMeta.className}`}>
                  {bmiMeta.label}
                </span>
              </p>
            </div>
          </div>
        </div>

        {notification && (
          <div className="mt-4 rounded-xl border border-[var(--rank-accent)]/20 bg-[var(--rank-accent)]/5 px-4 py-2 text-xs font-semibold text-[var(--rank-accent)] animate-fade-in">
            {notification}
          </div>
        )}
      </div>

      {/* Navigation Tabs (4 buttons: Today, Weekly plan, Body Profile, Sports) */}
      <div className="flex justify-start">
        <div className="inline-flex rounded-2xl border border-slate-800 bg-slate-950/55 p-1">
          {[
            { id: "today" as const, label: "Today", icon: Hourglass },
            { id: "weekly" as const, label: "Weekly plan", icon: Layers },
            { id: "profile" as const, label: "Body Profile", icon: User },
            { id: "sports" as const, label: "Sports", icon: Trophy },
          ].map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                type="button"
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.1em] transition-all duration-100 active:scale-95 ${activeView === view.id
                    ? "bg-[var(--rank-accent)]/15 text-white shadow-[var(--rank-accent-glow-subtle)]"
                    : "text-slate-400 hover:text-white"
                  }`}
                onClick={() => setActiveView(view.id)}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: "var(--rank-accent)" }} />
                <span>{view.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div>
        {activeView === "today" && (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-sm sm:p-6">
            <TodayWorkoutView
              isRestDay={isTodayRest}
              items={todaysItems}
              onToggleWorkoutCompleted={toggleWorkoutCompleted}
              todayName={todayName}
              todaysSports={todaysSports}
              onToggleSportCompleted={handleToggleSportCompleted}
            />
          </div>
        )}

        {activeView === "sports" && (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-sm sm:p-6">
            <SportsView
              sportsList={sportsList}
              onAddSport={(name, hours, minutes, day, repeatWeekly) => {
                const dateStr = getWeekdayDateInCurrentWeek(day);
                
                const newSport = {
                  id: Date.now(),
                  name,
                  hours,
                  minutes,
                  day,
                  repeatWeekly,
                  completed: false,
                  lastCompletedDate: "",
                  dateLogged: dateStr,
                  timestamp: Date.now(),
                };
                
                const updated = [...sportsList, newSport];
                setSportsList(updated);
                localStorage.setItem("nect_workout_sports_list", JSON.stringify(updated));
              }}
              onDeleteSport={(id) => {
                const updated = sportsList.filter((s) => s.id !== id);
                setSportsList(updated);
                localStorage.setItem("nect_workout_sports_list", JSON.stringify(updated));
              }}
            />
          </div>
        )}

        {activeView === "weekly" && (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-sm sm:p-6">
            <WeeklyPlanView
              bodyPart={bodyPart}
              daySummaries={daySummaries}
              exerciseName={exerciseName}
              onAddWorkout={addWorkout}
              onDeleteWorkout={deleteWorkout}
              onSetBodyPart={setBodyPart}
              onSetExerciseName={setExerciseName}
              onSetReps={setReps}
              onSetSelectedDay={setSelectedDay}
              onSetSets={setSets}
              onToggleRestDay={toggleRestDay}
              reps={reps}
              restDays={restDays}
              selectedDay={selectedDay}
              sets={sets}
              workoutItems={workoutItems}
            />
          </div>
        )}

        {activeView === "profile" && (
          <div className="space-y-8 w-full max-w-6xl mx-auto">
            <HealthTelemetry
              bmi={bmi}
              bmiMeta={bmiMeta}
              height={height}
              setHeight={setHeight}
              setWeight={setWeight}
              weight={weight}
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
            <SleepLoggerSegment
              sleepLogs={sleepLogs}
              onSaveSleep={(day, sH, sM, wH, wM) => {
                const newLog = {
                  day,
                  sleepHour: sH,
                  sleepMin: sM,
                  wakeHour: wH,
                  wakeMin: wM,
                  timestamp: Date.now(),
                };
                const updated = [...sleepLogs.filter((log) => log.day !== day), newLog];
                setSleepLogs(updated);
                localStorage.setItem("nect_workout_sleep_logs", JSON.stringify(updated));
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function HealthTelemetry({
  bmi,
  bmiMeta,
  height,
  setHeight,
  setWeight,
  weight,
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
  bmi: number;
  bmiMeta: { label: string; className: string };
  height: number;
  setHeight: (value: number) => void;
  setWeight: (value: number) => void;
  weight: number;
  age: number;
  setAge: (value: number) => void;
  dob: string;
  setDob: (value: string) => void;
  biologicalSex: "Men" | "Women";
  setBiologicalSex: (value: "Men" | "Women") => void;
  activityMultiplier: "Sedentary" | "Lightly Active" | "Moderately Active" | "Very Active";
  setActivityMultiplier: (value: "Sedentary" | "Lightly Active" | "Moderately Active" | "Very Active") => void;
  proteinActivityFactor: "Sedentary" | "Active" | "Strength";
  setProteinActivityFactor: (value: "Sedentary" | "Active" | "Strength") => void;
}) {
  return (
    <aside className="rounded-2xl border border-slate-800/80 bg-slate-900/45 p-6 backdrop-blur-sm">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
        Add Your Info
      </p>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <label className="space-y-2 block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            Weight kg
          </span>
          <input
            className={`${fieldClass} w-full`}
            min={1}
            type="number"
            value={weight}
            onChange={(event) => setWeight(Number(event.target.value))}
          />
        </label>
        <label className="space-y-2 block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            Height cm
          </span>
          <input
            className={`${fieldClass} w-full`}
            min={1}
            type="number"
            value={height}
            onChange={(event) => setHeight(Number(event.target.value))}
          />
        </label>
        <label className="space-y-2 block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            Date of Birth
          </span>
          <input
            className={`${fieldClass} w-full`}
            type="date"
            value={dob}
            onChange={(event) => setDob(event.target.value)}
          />
        </label>
        <label className="space-y-2 block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            Age (Years)
          </span>
          <input
            className={`${fieldClass} w-full opacity-60 cursor-not-allowed`}
            type="number"
            value={age}
            readOnly
          />
        </label>
        <label className="space-y-2 block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            Biological Sex
          </span>
          <select
            className={`${fieldClass} w-full cursor-pointer`}
            value={biologicalSex}
            onChange={(event) => setBiologicalSex(event.target.value as "Men" | "Women")}
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
          </select>
        </label>
        <label className="space-y-2 block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 block">
            Activity Level
          </span>
          <select
            className={`${fieldClass} w-full cursor-pointer`}
            value={activityMultiplier}
            onChange={(event) => setActivityMultiplier(event.target.value as any)}
          >
            <option value="Sedentary">Sedentary</option>
            <option value="Lightly Active">Lightly Active</option>
            <option value="Moderately Active">Moderately Active</option>
            <option value="Very Active">Very Active</option>
          </select>
        </label>
        <label className="space-y-2 block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 block">
            Protein Factor
          </span>
          <select
            className={`${fieldClass} w-full cursor-pointer`}
            value={proteinActivityFactor}
            onChange={(event) => setProteinActivityFactor(event.target.value as any)}
          >
            <option value="Sedentary">General Health</option>
            <option value="Active">Stamina</option>
            <option value="Strength">Strength</option>
          </select>
        </label>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            BMI
          </p>
          <p className="mt-1 text-2xl font-black text-white">{bmi.toFixed(1)}</p>
        </div>
        <span className={`rounded-full px-3 py-2 text-sm font-black ${bmiMeta.className}`}>
          {bmiMeta.label}
        </span>
      </div>
    </aside>
  );
}

function SleepLoggerSegment({
  sleepLogs,
  onSaveSleep,
}: {
  sleepLogs: any[];
  onSaveSleep: (day: DayName, sleepHour: number, sleepMin: number, wakeHour: number, wakeMin: number) => void;
}) {
  const dayNamesMapping: DayName[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const todayIndex = new Date().getDay();
  const yesterdayIndex = todayIndex === 0 ? 6 : todayIndex - 1;
  const yesterdayName = dayNamesMapping[yesterdayIndex];
  const todayName = dayNamesMapping[todayIndex];
  
  const [sleepTime, setSleepTime] = useState("22:00");
  const [wakeTime, setWakeTime] = useState("06:00");

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const [sHour, sMin] = sleepTime.split(":").map(Number);
    const [wHour, wMin] = wakeTime.split(":").map(Number);
    onSaveSleep(todayName, sHour, sMin, wHour, wMin);
  };

  const currentDayLog = sleepLogs.find((l) => l.day === todayName);

  return (
    <aside className="rounded-2xl border border-slate-800/80 bg-slate-900/45 p-6 backdrop-blur-sm">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
        Log Sleep
      </p>

      <form onSubmit={handleSave} className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 block">
            Slept Time ({yesterdayName}) (24h)
          </span>
          <input
            type="time"
            required
            className={`${fieldClass} w-full cursor-pointer`}
            value={sleepTime}
            onChange={(e) => setSleepTime(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 block">
            Woke Up Time ({todayName}) (24h)
          </span>
          <input
            type="time"
            required
            className={`${fieldClass} w-full cursor-pointer`}
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-indigo-950/40 border border-indigo-550/30 hover:bg-indigo-900/50 py-3 text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer active:scale-95 h-[46px] flex items-center justify-center"
        >
          Save Sleep Log
        </button>
      </form>

      {currentDayLog && (
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-4 flex items-center justify-between text-xs text-slate-400">
          <div>
            <p className="font-bold text-slate-350">Logged for Today ({todayName}):</p>
            <p className="mt-1 font-mono text-[11px]">
              Slept ({yesterdayName}): {formatNumber(currentDayLog.sleepHour)}:{formatNumber(currentDayLog.sleepMin)} | Woke ({todayName}): {formatNumber(currentDayLog.wakeHour)}:{formatNumber(currentDayLog.wakeMin)}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-indigo-950/30 border border-indigo-500/20 rounded px-2 py-1 text-indigo-300 font-bold shrink-0">
            <Moon className="h-3 w-3" />
            <span>
              {(() => {
                const sTotal = currentDayLog.sleepHour * 60 + currentDayLog.sleepMin;
                const wTotal = currentDayLog.wakeHour * 60 + currentDayLog.wakeMin;
                let diff = wTotal >= sTotal ? wTotal - sTotal : (24 * 60 - sTotal) + wTotal;
                return `${Math.floor(diff / 60)}h ${diff % 60}m`;
              })()}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}

function TodayWorkoutView({
  isRestDay,
  items,
  onToggleWorkoutCompleted,
  todayName,
  todaysSports,
  onToggleSportCompleted,
}: {
  isRestDay: boolean;
  items: WorkoutItem[];
  onToggleWorkoutCompleted: (itemId: number) => void;
  todayName: DayName;
  todaysSports: any[];
  onToggleSportCompleted: (id: number) => void;
}) {
  if (isRestDay) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-[var(--rank-accent)]/30 bg-slate-950/45 p-8 text-center space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-300">
            {todayName}
          </p>
          <h2 className="mt-4 text-3xl font-black text-white">
            Active Rest Day
          </h2>
          <p className="mt-3 max-w-xl text-slate-400">
            Your streak is completely protected. Recover, hydrate, and bridge the
            streak safely into the next active workout day.
          </p>
        </div>

        {/* Today's Sports Section for Rest Day */}
        {todaysSports.length > 0 && (
          <div className="w-full max-w-xl text-left flex flex-wrap gap-2.5 p-4 rounded-2xl border border-slate-800/80 bg-slate-950/30">
            <div className="w-full text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 mb-1">
              Extra Sports Activities
            </div>
            {todaysSports.map((sport) => {
              const todayDateStr = new Date().toISOString().split("T")[0];
              const isCompleted = sport.repeatWeekly 
                ? sport.lastCompletedDate === todayDateStr 
                : sport.completed;
              return (
                <div 
                  key={sport.id} 
                  className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all duration-300 bg-slate-950/40 ${
                    isCompleted 
                      ? "border-emerald-500/35 bg-emerald-500/5 text-emerald-400" 
                      : "border-slate-800 text-slate-300"
                  }`}
                >
                  <Trophy className={`h-3.5 w-3.5 ${isCompleted ? "text-emerald-405" : "text-indigo-400"}`} />
                  <span>
                    Extra Sports : <strong className="text-white">{sport.name}</strong> ({sport.hours}h {sport.minutes}m)
                  </span>
                  <span className="text-slate-500">•</span>
                  <button
                    type="button"
                    onClick={() => onToggleSportCompleted(sport.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all duration-150 active:scale-95 ${
                      isCompleted 
                        ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20" 
                        : "bg-indigo-950/40 border border-indigo-550/30 text-indigo-300 hover:bg-indigo-900/50"
                    }`}
                  >
                    {isCompleted ? "Completed" : "Mark Done"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
            {todayName}
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Todays Workout
          </h2>
        </div>
      </div>

      {/* Today's Sports Section */}
      {todaysSports.length > 0 && (
        <div className="flex flex-wrap gap-2.5 p-4 rounded-2xl border border-slate-800/80 bg-slate-950/30">
          <div className="w-full text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 mb-1">
            Extra Sports Activities
          </div>
          {todaysSports.map((sport) => {
            const todayDateStr = new Date().toISOString().split("T")[0];
            const isCompleted = sport.repeatWeekly 
              ? sport.lastCompletedDate === todayDateStr 
              : sport.completed;
            return (
              <div 
                key={sport.id} 
                className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all duration-300 bg-slate-950/40 ${
                  isCompleted 
                    ? "border-emerald-500/35 bg-emerald-500/5 text-emerald-400" 
                    : "border-slate-800 text-slate-300"
                }`}
              >
                <Trophy className={`h-3.5 w-3.5 ${isCompleted ? "text-emerald-405" : "text-indigo-400"}`} />
                <span>
                  Extra Sports : <strong className="text-white">{sport.name}</strong> ({sport.hours}h {sport.minutes}m)
                </span>
                <span className="text-slate-500">•</span>
                <button
                  type="button"
                  onClick={() => onToggleSportCompleted(sport.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all duration-150 active:scale-95 ${
                    isCompleted 
                      ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20" 
                      : "bg-indigo-950/40 border border-indigo-550/30 text-indigo-300 hover:bg-indigo-900/50"
                  }`}
                >
                  {isCompleted ? "Completed" : "Mark Done"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-8 text-center text-slate-400">
          No exercises are scheduled for today. Add movements from Weekly Plan.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <div className="hidden grid-cols-[1.4fr_0.5fr_0.5fr_1.5fr] gap-4 bg-slate-950/80 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500 md:grid">
            <span>Exercise</span>
            <span>Reps</span>
            <span>Sets</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-slate-800">
            {items.map((item) => {
              const isComplete = isWorkoutCompleted(item);

              return (
                <div
                  key={item.id}
                  className={`grid gap-4 bg-slate-950/35 px-4 py-4 transition-all duration-300 md:grid-cols-[1.4fr_0.5fr_0.5fr_1.5fr] items-center ${isComplete ? "opacity-60 bg-emerald-500/5" : "opacity-100"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-950/80 border border-slate-800 p-1.5 overflow-hidden">
                      <img
                        src={getBodyPartIcon(item.bodyPart)}
                        alt={item.bodyPart}
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                    <div>
                      <p
                        className={`font-bold text-white transition-all duration-300 ${isComplete ? "text-slate-500 line-through" : ""
                          }`}
                      >
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{item.bodyPart}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-300 md:text-base">
                    {item.reps}
                  </p>
                  <p className="text-sm font-bold text-slate-300 md:text-base">
                    {item.sets}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      type="button"
                      animate={isComplete ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.2 }}
                      onClick={() => onToggleWorkoutCompleted(item.id)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-black uppercase tracking-[0.1em] transition-all duration-200 active:scale-95 border ${isComplete
                          ? "border-emerald-500/35 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)] text-[10px]"
                          : "border-red-500/20 bg-red-500/10 text-red-400 hover:border-red-500/40 hover:bg-red-500/20 text-[9px]"
                        }`}
                    >
                      <Check className={`h-3 w-3 ${isComplete ? "text-emerald-400" : "text-red-400"}`} />
                      <span>{isComplete ? "Completed" : "Mark Completed"}</span>
                    </motion.button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function WeeklyPlanView({
  bodyPart,
  daySummaries,
  exerciseName,
  onAddWorkout,
  onDeleteWorkout,
  onSetBodyPart,
  onSetExerciseName,
  onSetReps,
  onSetSelectedDay,
  onSetSets,
  onToggleRestDay,
  reps,
  restDays,
  selectedDay,
  sets,
  workoutItems,
}: {
  bodyPart: string;
  daySummaries: { day: DayName; label: string }[];
  exerciseName: string;
  onAddWorkout: (event: FormEvent<HTMLFormElement>) => void;
  onDeleteWorkout: (id: number) => void;
  onSetBodyPart: (value: string) => void;
  onSetExerciseName: (value: string) => void;
  onSetReps: (value: number) => void;
  onSetSelectedDay: (value: DayName) => void;
  onSetSets: (value: number) => void;
  onToggleRestDay: (day: DayName, isRest: boolean) => void;
  reps: number;
  restDays: Record<DayName, boolean>;
  selectedDay: DayName;
  sets: number;
  workoutItems: WorkoutItem[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
          Day Split Row Matrix
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {daySummaries.map(({ day }) => (
            <button
              key={day}
              type="button"
              className={`py-3 px-2 rounded-2xl border text-center transition-all duration-100 active:scale-95 ${selectedDay === day
                  ? "border-[var(--rank-accent)] bg-[var(--rank-accent)]/12 shadow-[0_0_12px_var(--rank-accent)]"
                  : "border-slate-800 bg-slate-950 hover:border-slate-600"
                }`}
              onClick={() => onSetSelectedDay(day)}
            >
              <p className="text-sm font-black text-white">{day}</p>
            </button>
          ))}
        </div>
      </div>

      <form
        className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5"
        onSubmit={onAddWorkout}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-white">Add Workout Plan</h2>
            <p className="mt-1 text-sm text-slate-400">
              Configure {selectedDay} as an active split or protected recovery interval.
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm font-bold text-slate-200 transition-transform duration-105 active:scale-95">
            <input
              type="checkbox"
              checked={restDays[selectedDay]}
              onChange={(event) => onToggleRestDay(selectedDay, event.target.checked)}
              className="h-4 w-4 accent-[var(--rank-accent)]"
            />
            Rest Interval
          </label>
        </div>

        <div className="mt-5 flex flex-col md:flex-row gap-6 items-center">
          {/* Interactive Muscle Select Grid */}
          <div className="flex flex-col items-center gap-2 p-4 bg-slate-955/60 border border-[var(--rank-accent)]/30 shadow-[var(--rank-accent-glow-subtle)] rounded-2xl shrink-0 w-full md:w-56">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">
              Interactive Muscle Select
            </span>
            <div className="grid grid-cols-3 gap-2 w-full">
              {["Chest", "Arms", "Legs", "Back", "Shoulders", "Core"].map((part) => {
                const isSelected = bodyPart.toLowerCase() === part.toLowerCase();
                return (
                  <button
                    key={part}
                    type="button"
                    onClick={() => onSetBodyPart(part)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${isSelected
                        ? "bg-indigo-950/50 border-indigo-500 text-indigo-200"
                        : "bg-slate-900/60 border-slate-800 text-slate-450 hover:border-slate-700 hover:text-slate-200"
                      }`}
                  >
                    <img
                      src={getBodyPartIcon(part)}
                      alt={part}
                      className="w-7 h-7 object-contain mb-1"
                    />
                    <span className="text-[8px] font-black uppercase tracking-wider text-center w-full truncate">
                      {part}
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400 mt-2">
              {bodyPart || "Select Part"}
            </span>
          </div>

          {/* Form Fields Column */}
          <div className="flex-1 w-full grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Target Muscle Group
                </span>
                <select
                  className={fieldClass}
                  value={bodyPart}
                  onChange={(event) => onSetBodyPart(event.target.value)}
                >
                  {["Chest", "Arms", "Legs", "Back", "Shoulders", "Core"].map((part) => (
                    <option key={part}>{part}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Exercise Name
                </span>
                <input
                  className={fieldClass}
                  placeholder="e.g. Overhead Dumbbell Press"
                  required
                  value={exerciseName}
                  onChange={(event) => onSetExerciseName(event.target.value)}
                />
              </label>
            </div>

            <div className="grid gap-3 grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Reps
                </span>
                <input
                  className={fieldClass}
                  min={1}
                  type="number"
                  value={reps}
                  onChange={(event) => onSetReps(Number(event.target.value))}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sets
                </span>
                <input
                  className={fieldClass}
                  min={1}
                  type="number"
                  value={sets}
                  onChange={(event) => onSetSets(Number(event.target.value))}
                />
              </label>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[var(--rank-accent)]/20 hover:bg-[var(--rank-accent)]/35 border border-[var(--rank-accent)]/40 px-4 text-xs font-black uppercase tracking-wider text-white transition-all duration-100 active:scale-95 flex items-center justify-center shadow-[var(--rank-accent-glow-subtle)]"
                >
                  Add to Split
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5">
        <h2 className="text-xl font-black text-white">Logged Workout Data Matrix</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {days.map((day) => {
            const items = workoutItems.filter((item) => item.day === day);

            return (
              <section
                key={day}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 animate-fade-in"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-black text-white">{day}</h3>
                  {restDays[day] && (
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                      Rest
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-3">
                  {items.length === 0 ? (
                    <p className="text-sm text-slate-500">No movements scheduled.</p>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-955/50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-955/80 border border-slate-800 p-1.5 overflow-hidden">
                            <img
                              src={getBodyPartIcon(item.bodyPart)}
                              alt={item.bodyPart}
                              className="h-8 w-8 object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-100">{item.name}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {item.bodyPart} - {item.sets} sets x {item.reps} reps
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-black text-rose-205 transition-transform duration-100 active:scale-95"
                          onClick={() => onDeleteWorkout(item.id)}
                          aria-label={`Delete ${item.name}`}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getBmiMeta(bmi: number) {
  if (bmi < 18.5) {
    return {
      label: "UNDERWEIGHT",
      className: "text-blue-400 bg-blue-500/10",
    };
  }

  if (bmi < 25) {
    return {
      label: "PERFECT",
      className: "text-emerald-400 bg-emerald-500/10",
    };
  }

  return {
    label: "OVERWEIGHT",
    className: "text-amber-400 bg-amber-500/10",
  };
}

function getWeekdayDateInCurrentWeek(targetDay: DayName): string {
  const dayNamesMapping: DayName[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = new Date();
  const currentDayIndex = today.getDay(); // 0 (Sun) to 6 (Sat)
  const targetDayIndex = dayNamesMapping.indexOf(targetDay);
  
  const diffDays = targetDayIndex - currentDayIndex;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + diffDays);
  return targetDate.toISOString().split("T")[0];
}

function SportsView({
  sportsList,
  onAddSport,
  onDeleteSport,
}: {
  sportsList: any[];
  onAddSport: (name: string, hours: number, minutes: number, day: DayName, repeatWeekly: boolean) => void;
  onDeleteSport: (id: number) => void;
}) {
  const [sportName, setSportName] = useState("");
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  
  const dayNamesMapping: DayName[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  
  const [selectedDay, setSelectedDay] = useState<DayName>(() => {
    const dayIndex = new Date().getDay();
    return dayNamesMapping[dayIndex];
  });
  
  const [repeatWeekly, setRepeatWeekly] = useState(true);

  const daysOfWeek: DayName[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const finalName = sportName.trim();
    if (!finalName) return;
    onAddSport(finalName, hours, minutes, selectedDay, repeatWeekly);
    setSportName("");
    setHours(1);
    setMinutes(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--rank-accent)]">
            Sports Registry
          </p>
          <h2 className="mt-2 text-2xl font-black text-white uppercase tracking-wider">
            Log Extra Sports
          </h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <aside className="rounded-2xl border border-slate-800/80 bg-slate-900/45 p-6 backdrop-blur-sm">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
            Add Sport Session
          </p>
          <form onSubmit={handleAdd} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Sport Name
                </span>
                <input
                  className={`${fieldClass} w-full`}
                  type="text"
                  required
                  placeholder="e.g. Football, Swimming"
                  value={sportName}
                  onChange={(e) => setSportName(e.target.value)}
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Select Day
                </span>
                <select
                  className={`${fieldClass} w-full`}
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value as DayName)}
                >
                  {daysOfWeek.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 block">
                Time Spent Playing
              </span>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Hr</span>
                  <input
                    type="number"
                    required
                    min={0}
                    max={23}
                    className={`${fieldClass} w-full`}
                    value={hours}
                    onChange={(e) => setHours(Math.max(0, Math.min(23, Number(e.target.value))))}
                  />
                </label>

                <label className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Min</span>
                  <input
                    type="number"
                    required
                    min={0}
                    max={59}
                    className={`${fieldClass} w-full`}
                    value={minutes}
                    onChange={(e) => setMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
                  />
                </label>
              </div>
            </div>

            <label className="flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/50 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={repeatWeekly}
                onChange={(e) => setRepeatWeekly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-650 focus:ring-indigo-500 focus:ring-offset-slate-900 focus:ring-2 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Repeat Every Week
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  If unchecked, it will only display during the current week.
                </span>
              </div>
            </label>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-950/40 border border-indigo-550/30 hover:bg-indigo-900/50 py-3 text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <Trophy className="h-4 w-4 text-[var(--rank-accent)]" />
              <span>Add Sport Session</span>
            </button>
          </form>
        </aside>

        <div className="space-y-4">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
            Registered Sports Cards
          </p>

          {sportsList.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-8 text-center text-slate-500 text-sm">
              No sports registry recorded. Log a sport session on the left to start.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-1 overflow-y-auto max-h-[420px] pr-1">
              {sportsList.map((sport) => (
                <div
                  key={sport.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center text-indigo-400 shrink-0">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm uppercase tracking-wide">
                        {sport.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-bold uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                        <span>{sport.day}</span>
                        <span>•</span>
                        <span>{sport.hours}h {sport.minutes}m</span>
                        <span>•</span>
                        <span className={`px-1 rounded text-[8px] ${sport.repeatWeekly ? "bg-indigo-950 text-indigo-300 border border-indigo-500/20" : "bg-amber-950 text-amber-300 border border-amber-500/20"}`}>
                          {sport.repeatWeekly ? "Weekly" : "One-off"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteSport(sport.id)}
                    className="text-2xs font-black uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors px-2 py-1 rounded bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
