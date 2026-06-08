"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";

type PriorityLevel = "low" | "medium" | "high";

interface Task {
  id: string;
  title: string;
  priority: PriorityLevel;
  completed: boolean;
}

interface TaskModuleProps {
  onAwardPoints: (amount: number) => void;
}

const defaultTasks: Task[] = [
  {
    id: "task-1",
    title: "Refactor Next.js dashboard routing",
    priority: "high",
    completed: false,
  },
  {
    id: "task-2",
    title: "Optimize database queries",
    priority: "medium",
    completed: true,
  },
  {
    id: "task-3",
    title: "Update markdown document files",
    priority: "low",
    completed: true,
  },
];

const getPriorityPoints = (priority: PriorityLevel): number => {
  switch (priority) {
    case "low":
      return 10;
    case "medium":
      return 15;
    case "high":
      return 20;
    default:
      return 0;
  }
};

export function TaskModule({ onAwardPoints }: TaskModuleProps) {
  // --- STATE ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newPriority, setNewPriority] = useState<PriorityLevel>("medium");
  const [notification, setNotification] = useState<string>("");

  // --- LOCAL STORAGE SYNC ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem("nect_tasks");
      if (stored) {
        setTasks(JSON.parse(stored));
      } else {
        setTasks(defaultTasks);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const saveState = (updatedTasks: Task[]) => {
    localStorage.setItem("nect_tasks", JSON.stringify(updatedTasks));
  };

  const showTempNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? "" : curr));
    }, 3000);
  };

  // --- HANDLERS ---
  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    const titleText = newTitle.trim();
    if (!titleText) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: titleText,
      priority: newPriority,
      completed: false,
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setNewTitle("");
    saveState(updatedTasks);
    showTempNotification(`Added: "${titleText}"`);
  };

  const handleToggleTask = (id: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        const points = getPriorityPoints(task.priority);
        
        // Award or deduct points
        onAwardPoints(nextCompleted ? points : -points);
        
        if (nextCompleted) {
          showTempNotification(`Task complete! Received +${points} XP`);
        } else {
          showTempNotification(`Task reverted. Deducted ${points} XP`);
        }
        
        return { ...task, completed: nextCompleted };
      }
      return task;
    });
    setTasks(updatedTasks);
    saveState(updatedTasks);
  };

  const handleDeleteTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    const updatedTasks = tasks.filter((t) => t.id !== id);
    setTasks(updatedTasks);
    saveState(updatedTasks);
    if (target) {
      showTempNotification(`Deleted: "${target.title}"`);
    }
  };

  return (
    <section className="space-y-6 animate-fade-in-up">
      {/* Header Panel */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--rank-accent)]/30 bg-slate-950/70 shadow-[0_0_28px_rgba(34,211,238,0.1)]">
            <Image
              src="/assets/icons/tasks.png"
              alt="Task module icon"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
              Checklist Engine
            </p>
            <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl tracking-wider">
              TASK MANAGEMENT
            </h1>
          </div>
        </div>

        {/* Real-time feedback alert banner */}
        {notification && (
          <span className="rounded-full border border-[var(--rank-accent)]/25 bg-[var(--rank-accent)]/10 px-4 py-2 text-sm font-semibold text-[var(--rank-accent)] animate-pulse">
            {notification}
          </span>
        )}
      </div>

      {/* Task Intake Form Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
          <Plus className="h-5 w-5 text-indigo-400" /> ➕ CREATE NEW TASK OBJECTIVE
        </h3>

        <form onSubmit={handleAddTask} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-[1.5fr_1fr_auto] items-end">
            
            {/* Task Description Text field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="taskTitleInput" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Task Title / Description
              </label>
              <input
                id="taskTitleInput"
                type="text"
                required
                placeholder="e.g. Review code functional modules"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-550 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
              />
            </div>

            {/* Segmented Priority selector control */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Priority Tier
              </span>
              <div className="grid grid-cols-3 rounded-xl border border-slate-800 bg-slate-950/50 p-1">
                <button
                  type="button"
                  onClick={() => setNewPriority("low")}
                  className={`rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer active:scale-95 ${
                    newPriority === "low"
                      ? "bg-slate-800 text-slate-200 border border-slate-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-355"
                  }`}
                >
                  Low
                </button>
                <button
                  type="button"
                  onClick={() => setNewPriority("medium")}
                  className={`rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer active:scale-95 ${
                    newPriority === "medium"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm"
                      : "text-slate-500 hover:text-slate-355"
                  }`}
                >
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => setNewPriority("high")}
                  className={`rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer active:scale-95 ${
                    newPriority === "high"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm"
                      : "text-slate-500 hover:text-slate-355"
                  }`}
                >
                  High
                </button>
              </div>
            </div>

            {/* Submission active-scale tactile button */}
            <button
              type="submit"
              className="w-full md:w-auto rounded-xl bg-indigo-650 hover:bg-indigo-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all duration-100 active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(99,102,241,0.2)]"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>

      {/* Main daily objectives tracker log table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
          📋 DAILY OBJECTIVE MATRIX LOG
        </h3>

        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-850 p-12 text-center text-slate-500 text-sm">
            All objectives complete! Clear queue or add a new objective to start.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 w-28">Status</th>
                  <th className="py-3 px-4">Task Description</th>
                  <th className="py-3 px-4 w-44">Priority Level</th>
                  <th className="py-3 px-4 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {tasks.map((task) => {
                  const pointsAwarded = getPriorityPoints(task.priority);
                  return (
                    <tr
                      key={task.id}
                      className={`transition-all duration-300 hover:bg-slate-950/15 ${
                        task.completed ? "opacity-40" : "opacity-100"
                      }`}
                    >
                      {/* STATUS CHECKBOX COLUMN */}
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-600 hover:text-slate-450 shrink-0" />
                          )}
                          <span>{task.completed ? "Done" : "Pending"}</span>
                        </button>
                      </td>

                      {/* TASK DESCRIPTION COLUMN WITH TACTILE line-through */}
                      <td className={`py-4 px-4 font-bold text-slate-200 transition-all duration-300 ${
                        task.completed ? "line-through text-slate-500" : ""
                      }`}>
                        {task.title}
                      </td>

                      {/* PRIORITY LEVEL BADGE COLUMN */}
                      <td className="py-4 px-4">
                        {task.priority === "low" && (
                          <span className="inline-flex rounded-full px-3 py-1 text-2xs font-bold uppercase tracking-wider text-slate-400 bg-slate-500/10 border border-slate-800">
                            🟢 Low (+{pointsAwarded} XP)
                          </span>
                        )}
                        {task.priority === "medium" && (
                          <span className="inline-flex rounded-full px-3 py-1 text-2xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20">
                            ⚠️ Medium (+{pointsAwarded} XP)
                          </span>
                        )}
                        {task.priority === "high" && (
                          <span className="inline-flex rounded-full px-3 py-1 text-2xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20">
                            🔴 High (+{pointsAwarded} XP)
                          </span>
                        )}
                      </td>

                      {/* ACTIONS COLUMN */}
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="rounded-lg border border-rose-500/10 bg-rose-500/5 p-2 text-rose-300 hover:text-rose-400 hover:bg-rose-500/15 transition-all duration-100 active:scale-95 cursor-pointer"
                          aria-label={`Delete task ${task.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
