"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState, useEffect } from "react";
import { Flame } from "lucide-react";

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
];

const dayIndex = new Date().getDay();
const todayName = days[dayIndex === 0 ? 6 : dayIndex - 1];

const fieldClass =
  "rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500";

export function ExerciseModule({
  weight: propWeight,
  setWeight: propSetWeight,
  height: propHeight,
  setHeight: propSetHeight,
}: {
  weight?: number;
  setWeight?: (w: number) => void;
  height?: number;
  setHeight?: (h: number) => void;
} = {}) {
  const [activeView, setActiveView] = useState<"today" | "weekly">("today");
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

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedWorkouts = localStorage.getItem("nect_workout_items");
      const storedRest = localStorage.getItem("nect_workout_rest_days");
      if (storedWorkouts) setWorkoutItems(JSON.parse(storedWorkouts));
      if (storedRest) setRestDays(JSON.parse(storedRest));
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

  const weight = propWeight !== undefined ? propWeight : internalWeight;
  const setWeight = propSetWeight !== undefined ? propSetWeight : setInternalWeight;
  const height = propHeight !== undefined ? propHeight : internalHeight;
  const setHeight = propSetHeight !== undefined ? propSetHeight : setInternalHeight;

  const [streak, setStreak] = useState(5);
  const [rewardedDays, setRewardedDays] = useState<DayName[]>([]);
  const [notification, setNotification] = useState("");

  const todaysItems = workoutItems.filter((item) => item.day === todayName);
  const isTodayRest = restDays[todayName];
  const bmi = height > 0 ? weight / (height / 100) ** 2 : 0;
  const bmiMeta = getBmiMeta(bmi);

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

  function toggleSet(itemId: number, setIndex: number) {
    let dayCompleted = false;

    setWorkoutItems((current) => {
      const next = current.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const checkedSets = item.checkedSets.map((checked, index) =>
          index === setIndex ? !checked : checked,
        );

        return { ...item, checkedSets };
      });

      dayCompleted =
        next.filter((item) => item.day === todayName).length > 0 &&
        next
          .filter((item) => item.day === todayName)
          .every((item) => item.checkedSets.every(Boolean));

      return next;
    });

    if (dayCompleted && !rewardedDays.includes(todayName)) {
      setRewardedDays((current) => [...current, todayName]);
      setStreak((current) => current + 1);
      setNotification("Today's workout complete. Streak advanced.");
    }
  }

  function skipActiveDay() {
    if (isTodayRest) {
      setNotification("Rest day detected. Your streak remains protected.");
      return;
    }

    setStreak(0);
    setNotification("Active workout skipped. Streak reset to 0.");
  }

  return (
    <section className="space-y-6 animate-fade-in-up">
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--rank-accent)]/30 bg-slate-950/70 shadow-[0_0_28px_rgba(34,211,238,0.1)]">
              <Image
                src="/assets/icons/exercise.png"
                alt="Workout module icon"
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Workout Module
              </p>
              <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">
                WORKOUT
              </h1>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StreakPill label="Streak" value={`${streak} Days`} />
            {notification && (
              <span className="rounded-full border border-[var(--rank-accent)]/25 bg-[var(--rank-accent)]/10 px-4 py-2 text-sm font-semibold text-[var(--rank-accent)]">
                {notification}
              </span>
            )}
          </div>

          <div className="mt-6 inline-flex rounded-2xl border border-slate-800 bg-slate-950/55 p-1">
            {[
              { id: "today" as const, label: "Today's Workout" },
              { id: "weekly" as const, label: "Weekly Plan" },
            ].map((view) => (
              <button
                key={view.id}
                type="button"
                className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.1em] transition-all duration-100 active:scale-95 ${
                  activeView === view.id
                    ? "bg-[var(--rank-accent)]/15 text-white shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                    : "text-slate-400 hover:text-white"
                }`}
                onClick={() => setActiveView(view.id)}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        <HealthTelemetry
          bmi={bmi}
          bmiMeta={bmiMeta}
          height={height}
          setHeight={setHeight}
          setWeight={setWeight}
          weight={weight}
        />
      </div>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-sm sm:p-6">
        {activeView === "today" ? (
          <TodayWorkoutView
            isRestDay={isTodayRest}
            items={todaysItems}
            onSkipDay={skipActiveDay}
            onToggleSet={toggleSet}
            todayName={todayName}
          />
        ) : (
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
}: {
  bmi: number;
  bmiMeta: { label: string; className: string };
  height: number;
  setHeight: (value: number) => void;
  setWeight: (value: number) => void;
  weight: number;
}) {
  return (
    <aside className="rounded-2xl border border-slate-800/80 bg-slate-900/45 p-6 backdrop-blur-sm">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
        Health Telemetry
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
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
        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
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

function TodayWorkoutView({
  isRestDay,
  items,
  onSkipDay,
  onToggleSet,
  todayName,
}: {
  isRestDay: boolean;
  items: WorkoutItem[];
  onSkipDay: () => void;
  onToggleSet: (itemId: number, setIndex: number) => void;
  todayName: DayName;
}) {
  if (isRestDay) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-[var(--rank-accent)]/30 bg-slate-950/45 p-8 text-center">
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
            Today&apos;s Execution Checklist
          </h2>
        </div>
        <button
          type="button"
          className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-200 transition-transform duration-100 active:scale-95"
          onClick={onSkipDay}
        >
          Skip Active Day
        </button>
      </div>

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
            <span>Checklist Status Tracking</span>
          </div>
          <div className="divide-y divide-slate-800">
            {items.map((item) => {
              const isComplete = item.checkedSets.every(Boolean);

              return (
                <div
                  key={item.id}
                  className={`grid gap-4 bg-slate-950/35 px-4 py-4 transition-all duration-300 md:grid-cols-[1.4fr_0.5fr_0.5fr_1.5fr] ${
                    isComplete ? "opacity-60" : "opacity-100"
                  }`}
                >
                  <div>
                    <p
                      className={`font-bold text-white transition-all duration-300 ${
                        isComplete ? "text-slate-500 line-through" : ""
                      }`}
                    >
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{item.bodyPart}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-300 md:text-base">
                    {item.reps}
                  </p>
                  <p className="text-sm font-bold text-slate-300 md:text-base">
                    {item.sets}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.checkedSets.map((checked, index) => (
                      <label
                        key={index}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-bold text-slate-300 transition-transform duration-100 active:scale-95"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleSet(item.id, index)}
                          className="h-4 w-4 accent-[var(--rank-accent)]"
                        />
                        S{index + 1}
                      </label>
                    ))}
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
          {daySummaries.map(({ day, label }) => (
            <button
              key={day}
              type="button"
              className={`min-h-28 rounded-2xl border p-4 text-left transition-all duration-100 active:scale-95 ${
                selectedDay === day
                  ? "border-[var(--rank-accent)] bg-[var(--rank-accent)]/12"
                  : "border-slate-800 bg-slate-950/45 hover:border-slate-600"
              }`}
              onClick={() => onSetSelectedDay(day)}
            >
              <p className="text-sm font-black text-white">{day}</p>
              <p className="mt-3 text-sm text-slate-400">{label}</p>
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
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm font-bold text-slate-200 transition-transform duration-100 active:scale-95">
            <input
              type="checkbox"
              checked={restDays[selectedDay]}
              onChange={(event) => onToggleRestDay(selectedDay, event.target.checked)}
              className="h-4 w-4 accent-[var(--rank-accent)]"
            />
            Rest Interval
          </label>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1.5fr_0.7fr_0.7fr_auto]">
          <select
            className={fieldClass}
            value={bodyPart}
            onChange={(event) => onSetBodyPart(event.target.value)}
          >
            {["Chest", "Arms", "Legs", "Back", "Shoulders", "Core"].map((part) => (
              <option key={part}>{part}</option>
            ))}
          </select>
          <input
            className={fieldClass}
            placeholder="Exercise Name"
            required
            value={exerciseName}
            onChange={(event) => onSetExerciseName(event.target.value)}
          />
          <input
            className={fieldClass}
            min={1}
            type="number"
            value={reps}
            onChange={(event) => onSetReps(Number(event.target.value))}
          />
          <input
            className={fieldClass}
            min={1}
            type="number"
            value={sets}
            onChange={(event) => onSetSets(Number(event.target.value))}
          />
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition-all duration-100 hover:bg-emerald-500 active:scale-95"
          >
            Add This Workout Plan
          </button>
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
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
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
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3"
                      >
                        <div>
                          <p className="font-bold text-slate-100">{item.name}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.bodyPart} - {item.sets} sets x {item.reps} reps
                          </p>
                        </div>
                        <button
                          type="button"
                          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-black text-rose-200 transition-transform duration-100 active:scale-95"
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

function StreakPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-slate-800 bg-slate-950/60 px-4 py-2 text-sm inline-flex items-center gap-1.5">
      <Flame className="h-4 w-4 text-orange-500 fill-orange-500/10" />
      <span className="font-bold text-slate-500">{label}: </span>
      <span className="font-black text-white">{value}</span>
    </span>
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
