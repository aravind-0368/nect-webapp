"use client";

import { useState, useEffect, FormEvent } from "react";
import { Plus, Trash2, Circle, PlusCircle, ClipboardList, Calendar, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNectStore } from "../store/useNectStore";

type PriorityLevel = "low" | "medium" | "high";

interface Task {
  id: string;
  title: string;
  priority: PriorityLevel;
  completed: boolean;
  date?: string;
  category: string;
}

const defaultTasks: Task[] = [];

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

const fieldClass =
  "rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-550 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25";

export function TaskModule() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Coding");

  // Intake form states
  const [newTitle, setNewTitle] = useState<string>("");
  const [newPriority, setNewPriority] = useState<PriorityLevel>("medium");
  const [newDate, setNewDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [notification, setNotification] = useState<string>("");

  // Inline category addition states
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  // UI States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // Zustand store
  const { awardPoints, userId } = useNectStore();

  const getTasksKey = () => userId ? `nect_tasks_${userId}` : "nect_tasks";
  const getCatsKey = () => userId ? `nect_task_categories_${userId}` : "nect_task_categories";

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedTasks = localStorage.getItem(getTasksKey());
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks(defaultTasks);
      }

      const storedCats = localStorage.getItem(getCatsKey());
      if (storedCats) {
        const parsedCats = JSON.parse(storedCats);
        setCategories(parsedCats);
        if (parsedCats.length > 0) {
          setSelectedCategory(parsedCats[0]);
        }
      } else {
        const initialCats = ["Coding", "Database", "Documentation", "Personal", "Urgent"];
        setCategories(initialCats);
        setSelectedCategory(initialCats[0]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [userId]);

  const saveState = (updatedTasks: Task[]) => {
    localStorage.setItem(getTasksKey(), JSON.stringify(updatedTasks));
  };

  const showTempNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? "" : curr));
    }, 3000);
  };

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    const titleText = newTitle.trim();
    if (!titleText) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: titleText,
      priority: newPriority,
      completed: false,
      date: newDate || undefined,
      category: selectedCategory || "General",
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setNewTitle("");
    setNewDate(new Date().toISOString().split("T")[0]);
    saveState(updatedTasks);
    setIsFormOpen(false);
    showTempNotification(`Added: "${titleText}"`);
  };

  const handleAddCategorySubmit = () => {
    const catName = newCategoryName.trim();
    if (!catName) return;

    const exists = categories.find((c) => c.toLowerCase() === catName.toLowerCase());
    if (exists) {
      setSelectedCategory(exists);
      setIsAddingCategory(false);
      setNewCategoryName("");
      return;
    }

    const updatedCats = [...categories, catName];
    setCategories(updatedCats);
    setSelectedCategory(catName);
    localStorage.setItem(getCatsKey(), JSON.stringify(updatedCats));
    setIsAddingCategory(false);
    setNewCategoryName("");
    showTempNotification(`Category "${catName}" created!`);
  };

  const handleToggleTask = (id: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        const points = getPriorityPoints(task.priority);

        // Award or deduct points from Zustand store
        awardPoints(nextCompleted ? points : -points, "Tasks");

        if (nextCompleted) {
          showTempNotification(`Task complete!`);
        } else {
          showTempNotification(`Task reverted.`);
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
      if (target.completed) {
        const points = getPriorityPoints(target.priority);
        awardPoints(-points, "Tasks");
      }
      showTempNotification(`Deleted: "${target.title}"`);
    }
  };

  // Filter tasks to only show incomplete tasks and sort by due date ascending
  const incompleteTasksSorted = tasks
    .filter((task) => !task.completed)
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    });

  return (
    <section className="space-y-6 animate-fade-in-up">
      {/* Top Panel (Main Panel) */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-left shrink-0">
              <h1 className="text-3xl font-black text-white uppercase tracking-wider">
                To Do Tasks
              </h1>
              <span className="text-[10px] font-black tracking-[0.2em] text-[var(--rank-accent)] mt-1.5 uppercase">
                Task Management Engine
              </span>
            </div>
          </div>

          {/* Real-time feedback alert banner */}
          {notification && (
            <span className="rounded-full border border-[var(--rank-accent)]/25 bg-[var(--rank-accent)]/10 px-4 py-2 text-xs font-semibold text-[var(--rank-accent)] animate-pulse">
              {notification}
            </span>
          )}
        </div>

        {/* Dynamic Telemetry / Status Row (3 Columns: Active Tasks, Completed, Completion Rate) */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-slate-800/80">
          {/* Active Tasks Indicator */}
          <div className="flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/50">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center">
              <ClipboardList className="h-5 w-5" style={{ color: "var(--rank-accent)" }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Tasks</p>
              <p className="text-sm font-black text-white">{tasks.filter(t => !t.completed).length}</p>
            </div>
          </div>

          {/* Completed Tasks Indicator */}
          <div className="flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/50">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center">
              <Check className="h-5 w-5" style={{ color: "var(--rank-accent)" }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed</p>
              <p className="text-sm font-black text-white">{tasks.filter(t => t.completed).length}</p>
            </div>
          </div>

          {/* Completion Rate Indicator */}
          <div className="flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/50">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center">
              <Calendar className="h-5 w-5" style={{ color: "var(--rank-accent)" }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completion Rate</p>
              <p className="text-sm font-black text-white">
                {tasks.length > 0 ? `${Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%` : "0%"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Trigger Row */}
      <div className="flex justify-start">
        {/* Add Task Button Outside */}
        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 active:scale-95 border cursor-pointer ${isFormOpen
              ? "bg-rose-500/10 border-rose-500/30 text-rose-455 hover:bg-rose-500/20"
              : "bg-indigo-650 hover:bg-indigo-600 border-indigo-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] animate-pulse"
            }`}
        >
          <Plus className={`h-4 w-4 transition-transform duration-200 ${isFormOpen ? "rotate-45" : ""}`} />
          <span>{isFormOpen ? "Close Panel" : "Add Task"}</span>
        </button>
      </div>

      {/* Collapsible Add Task Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
              <PlusCircle className="h-5 w-5 text-indigo-455" /> CREATE NEW TASK OBJECTIVE
            </h3>

            <form onSubmit={handleAddTask} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr_1fr_1fr] items-end">

                {/* Task Name Input */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="taskTitleInput" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Task
                  </label>
                  <input
                    id="taskTitleInput"
                    type="text"
                    required
                    placeholder="e.g. Review code functional modules"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className={fieldClass}
                  />
                </div>

                {/* Due Date Input */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="taskDateInput" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Due Date
                  </label>
                  <input
                    id="taskDateInput"
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className={`${fieldClass} cursor-pointer`}
                  />
                </div>

                {/* Category Select with Add Category inline button */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="taskCategorySelect" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Category
                  </label>
                  <div className="flex gap-2 items-center w-full">
                    {isAddingCategory ? (
                      <div className="flex items-center gap-1.5 flex-1 bg-slate-950/70 border border-slate-700 rounded-xl px-2 py-0.5">
                        <input
                          type="text"
                          placeholder="New Category..."
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="bg-transparent border-none outline-none text-sm text-slate-100 placeholder:text-slate-500 flex-1 px-2 py-3"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCategorySubmit();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddCategorySubmit}
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-450 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors cursor-pointer"
                          title="Save Category"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingCategory(false);
                            setNewCategoryName("");
                          }}
                          className="p-2 rounded-lg bg-rose-500/10 text-rose-455 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <select
                          id="taskCategorySelect"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className={`${fieldClass} flex-1 cursor-pointer`}
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsAddingCategory(true)}
                          className="p-3.5 rounded-xl border border-slate-700 bg-slate-955 hover:bg-slate-900 text-slate-300 hover:text-white transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                          title="Add new category"
                        >
                          <Plus className="h-4.5 w-4.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Importance Selector */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Importance
                  </span>
                  <div className="grid grid-cols-3 rounded-xl border border-slate-800 bg-slate-950/50 p-1">
                    <button
                      type="button"
                      onClick={() => setNewPriority("low")}
                      className={`rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer active:scale-95 ${newPriority === "low"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                          : "text-slate-500 hover:text-slate-350"
                        }`}
                    >
                      Low
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPriority("medium")}
                      className={`rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer active:scale-95 ${newPriority === "medium"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm"
                          : "text-slate-500 hover:text-slate-350"
                        }`}
                    >
                      Med
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPriority("high")}
                      className={`rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer active:scale-95 ${newPriority === "high"
                          ? "bg-rose-500/10 text-rose-455 border border-rose-500/20 shadow-sm"
                          : "text-slate-500 hover:text-slate-350"
                        }`}
                    >
                      High
                    </button>
                  </div>
                </div>

              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-650 hover:bg-indigo-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-all duration-100 active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
              Matrix Board
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Task Board
            </h2>
          </div>
        </div>

        {incompleteTasksSorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/45 p-12 text-center text-slate-500 text-sm">
            All tasks completed! Click the Add Task button above to log a new objective.
          </div>
        ) : (
          <motion.div
            layout
            className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            {incompleteTasksSorted.map((task) => {
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative rounded-2xl border border-slate-800/80 bg-slate-955/40 p-5 pt-9 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/30"
                >
                  {/* Category tag on the top center border */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-indigo-400 shadow-md">
                    {task.category || "General"}
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Custom Checkbox (Unchecked since we only render incomplete tasks here) */}
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 transition-all cursor-pointer active:scale-95"
                      title="Mark Complete"
                    >
                      <Circle className="h-4.5 w-4.5 text-slate-700 hover:text-slate-400" />
                    </button>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-bold text-white text-base leading-snug break-words flex-1 min-w-0">
                          {task.title}
                        </h4>

                        {/* Priority tag on the right corner in the same line as task name */}
                        <div className="shrink-0 pt-0.5">
                          {task.priority === "high" && (
                            <span className="inline-flex items-center rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-rose-400">
                              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                              High
                            </span>
                          )}
                          {task.priority === "medium" && (
                            <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-400">
                              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                              Medium
                            </span>
                          )}
                          {task.priority === "low" && (
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                              Low
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Date under the task name */}
                      <div className="mt-2 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-indigo-455" />
                        <span>{task.date ? task.date : "No Date"}</span>
                      </div>

                      {/* Delete button positioned nicely */}
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="rounded-lg border border-rose-500/10 bg-rose-500/5 p-2 text-rose-455 hover:text-rose-350 hover:bg-rose-500/15 transition-all duration-100 active:scale-95 cursor-pointer"
                          aria-label={`Delete task ${task.title}`}
                          title="Delete Task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
