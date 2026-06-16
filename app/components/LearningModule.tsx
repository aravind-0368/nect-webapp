"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState, useEffect } from "react";
import { BookOpen, Plus, Clock, Award, Star, Trash2, Calendar, Radio, Lamp, RotateCcw, GraduationCap, Pencil } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
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

type StudySession = {
  id: number;
  subject: string;
  hours: number;
  minutes: number;
  day: DayName;
};

type RevisionSubject = {
  id: number;
  name: string;
  checked: boolean;
};

type ExamRecord = {
  id: number;
  title: string;
  isMain: boolean;
  totalMarks: number;
  gainedMarks: number;
  date?: string; // mandatory for Main Exam
};

const daysOfWeek: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const initialSessions: StudySession[] = [
  { id: 1, subject: "Data Structures", hours: 2, minutes: 30, day: "Monday" },
  { id: 2, subject: "Advanced Algorithms", hours: 3, minutes: 15, day: "Tuesday" },
  { id: 3, subject: "Discrete Mathematics", hours: 1, minutes: 45, day: "Wednesday" },
  { id: 4, subject: "Operating Systems", hours: 2, minutes: 0, day: "Thursday" },
  { id: 5, subject: "Systems Architecture", hours: 4, minutes: 30, day: "Friday" },
  { id: 6, subject: "AI Engineering", hours: 5, minutes: 0, day: "Saturday" },
];

const initialRevisions: RevisionSubject[] = [
  { id: 1, name: "Data Structures", checked: false },
  { id: 2, name: "Advanced Algorithms", checked: false },
  { id: 3, name: "Operating Systems", checked: false },
  { id: 4, name: "Systems Architecture", checked: false },
];

const getFutureDateString = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
};

const initialExams: ExamRecord[] = [
  { id: 1, title: "Data Structures Quiz", isMain: false, totalMarks: 50, gainedMarks: 40 },
  { id: 2, title: "Algorithms Midterm", isMain: true, totalMarks: 100, gainedMarks: 85, date: getFutureDateString(-15) },
  { id: 3, title: "Discrete Math Test", isMain: false, totalMarks: 20, gainedMarks: 12 },
  { id: 4, title: "Systems Midterm", isMain: true, totalMarks: 100, gainedMarks: 92, date: getFutureDateString(-5) },
  { id: 5, title: "AI Engineering Final", isMain: true, totalMarks: 100, gainedMarks: 0, date: getFutureDateString(4) },
];

const fieldClass =
  "rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500";

export function LearningModule() {
  const [activeTab, setActiveTab] = useState<"table" | "vault" | "hub">("table");
  const [sessions, setSessions] = useState<StudySession[]>(initialSessions);
  const [revisions, setRevisions] = useState<RevisionSubject[]>(initialRevisions);
  const [exams, setExams] = useState<ExamRecord[]>(initialExams);
  
  // Zustand hook
  const {
    smartStreak,
    incrementSmartStreak,
    decaySmartStreak,
    awardPoints,
    triggerPeakMentalPower,
  } = useNectStore();

  const [notification, setNotification] = useState("");
  const [showSplash, setShowSplash] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedSessions = localStorage.getItem("nect_learning_sessions");
      const storedRevisions = localStorage.getItem("nect_learning_revisions");
      const storedExams = localStorage.getItem("nect_learning_exams");
      if (storedSessions) setSessions(JSON.parse(storedSessions));
      if (storedRevisions) setRevisions(JSON.parse(storedRevisions));
      if (storedExams) setExams(JSON.parse(storedExams));
      setIsLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("nect_learning_sessions", JSON.stringify(sessions));
  }, [sessions, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("nect_learning_revisions", JSON.stringify(revisions));
  }, [revisions, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("nect_learning_exams", JSON.stringify(exams));
  }, [exams, isLoaded]);

  // Form states - Study Logger
  const [studySubject, setStudySubject] = useState("");
  const [studyHours, setStudyHours] = useState<number>(1);
  const [studyMinutes, setStudyMinutes] = useState<number>(0);
  const [studyDay, setStudyDay] = useState<DayName>("Monday");

  // Form states - Revision Vault
  const [newRevisionSubject, setNewRevisionSubject] = useState("");

  // Form states - Exam Registry
  const [examTitle, setExamTitle] = useState("");
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [gainedMarks, setGainedMarks] = useState<number>(80);
  const [examDate, setExamDate] = useState("");
  const [isMain, setIsMain] = useState(false);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);

  // Calculate nearest upcoming Main Exam
  const nearestMainExam = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = exams
      .filter((e) => e.isMain && e.date)
      .map((e) => {
        const examD = new Date(e.date!);
        examD.setHours(0, 0, 0, 0);
        const diffTime = examD.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...e, daysLeft: diffDays, examD };
      })
      .filter((e) => e.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    return upcoming.length > 0 ? upcoming[0] : null;
  }, [exams]);

  // Aggregate Study Table Hours
  const dailyStudyStats = useMemo(() => {
    return daysOfWeek.map((day) => {
      const daySessions = sessions.filter((s) => s.day === day);
      const totalMinutes = daySessions.reduce((sum, s) => sum + s.hours * 60 + s.minutes, 0);
      const totalHours = totalMinutes / 60;
      return {
        day,
        hours: totalHours,
        label: `${Math.floor(totalHours)}h ${Math.round((totalHours % 1) * 60)}m`,
      };
    });
  }, [sessions]);

  // Micro-metrics Study Table
  const studyMetrics = useMemo(() => {
    const totalMinutes = sessions.reduce((sum, s) => sum + s.hours * 60 + s.minutes, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    const subjectMap: Record<string, number> = {};
    sessions.forEach((s) => {
      const mins = s.hours * 60 + s.minutes;
      subjectMap[s.subject] = (subjectMap[s.subject] || 0) + mins;
    });

    let maxMins = 0;
    let mostStudied = "None";
    Object.entries(subjectMap).forEach(([subj, mins]) => {
      if (mins > maxMins) {
        maxMins = mins;
        mostStudied = subj;
      }
    });

    return {
      totalHours,
      mostStudied,
    };
  }, [sessions]);

  // Check if all revisions are checked
  const allRevisionsChecked = useMemo(() => {
    return revisions.length > 0 && revisions.every((r) => r.checked);
  }, [revisions]);

  // Handlers - Study Table
  function handleAddSession(e: FormEvent) {
    e.preventDefault();
    if (!studySubject.trim()) return;

    const newSession: StudySession = {
      id: Date.now(),
      subject: studySubject,
      hours: studyHours,
      minutes: studyMinutes,
      day: studyDay,
    };

    setSessions((curr) => [...curr, newSession]);
    setStudySubject("");
    setStudyHours(1);
    setStudyMinutes(0);
    
    // Award 40 XP for logging a study session
    awardPoints(40, "Learning");
    setNotification(`Logged ${studyHours}h ${studyMinutes}m study session. +40 XP awarded.`);
  }

  function handleDeleteSession(id: number) {
    setSessions((curr) => curr.filter((s) => s.id !== id));
  }

  // Handlers - Revision Vault
  function handleAddRevision(e: FormEvent) {
    e.preventDefault();
    if (!newRevisionSubject.trim()) return;

    const newItem: RevisionSubject = {
      id: Date.now(),
      name: newRevisionSubject,
      checked: false,
    };

    setRevisions((curr) => [...curr, newItem]);
    setNewRevisionSubject("");
    setNotification(`Added ${newRevisionSubject} to revision queue.`);
  }

  function handleToggleRevision(id: number) {
    let wasChecked = false;
    revisions.forEach((r) => {
      if (r.id === id) wasChecked = r.checked;
    });

    setRevisions((curr) =>
      curr.map((r) => (r.id === id ? { ...r, checked: !r.checked } : r)),
    );

    // Award a minor +10 XP for checking off a revision subject
    if (!wasChecked) {
      awardPoints(10, "Learning");
    }
  }

  function handleDeleteRevision(id: number) {
    setRevisions((curr) => curr.filter((r) => r.id !== id));
  }

  function handleCompleteRevisionCycle() {
    // Award +50 points for cycle complete
    awardPoints(50, "Learning");
    incrementSmartStreak();
    setShowSplash(true);
    setNotification("Revision completed! +50 Points added. Streak advanced!");

    setRevisions((curr) => curr.map((r) => ({ ...r, checked: false })));

    setTimeout(() => {
      setShowSplash(false);
    }, 3000);
  }

  function handleDecayStreak() {
    decaySmartStreak();
    setNotification("Revision cycle missed. Tome Streak decayed back to 0.");
  }

  // Handlers - Exam Hub
  function handleSaveExam(e: FormEvent) {
    e.preventDefault();
    if (!examTitle.trim()) return;

    const finalTotalMarks = totalMarks;
    const finalGainedMarks = gainedMarks;

    const scorePct = finalTotalMarks > 0 ? Math.round((finalGainedMarks / finalTotalMarks) * 100) : 0;
    if (isMain && scorePct > 90) {
      triggerPeakMentalPower();
    }

    if (editingExamId !== null) {
      // Edit mode
      setExams((curr) =>
        curr.map((item) =>
          item.id === editingExamId
            ? {
                ...item,
                title: examTitle,
                isMain,
                totalMarks: finalTotalMarks,
                gainedMarks: finalGainedMarks,
                date: examDate || undefined,
              }
            : item
        )
      );
      setEditingExamId(null);
      setNotification(`Exam '${examTitle}' updated successfully.`);
    } else {
      // Create mode
      const newExam: ExamRecord = {
        id: Date.now(),
        title: examTitle,
        isMain,
        totalMarks: finalTotalMarks,
        gainedMarks: finalGainedMarks,
        date: examDate || undefined,
      };

      setExams((curr) => [...curr, newExam]);

      // Award points based on performance in exams
      const pointsEarned = Math.round(scorePct * 1.5);
      awardPoints(pointsEarned, "Learning");

      if (isMain && scorePct > 90) {
        setNotification(`Peak Performance achieved! Exam '${examTitle}' logged. +${pointsEarned} XP. Brain node glowing purple for 2 days!`);
      } else {
        setNotification(`Exam '${examTitle}' registered. +${pointsEarned} XP awarded.`);
      }
    }

    // Reset form states
    setExamTitle("");
    setTotalMarks(100);
    setGainedMarks(80);
    setExamDate("");
    setIsMain(false);
  }

  function handleStartEditExam(exam: ExamRecord) {
    setEditingExamId(exam.id);
    setExamTitle(exam.title);
    setTotalMarks(exam.totalMarks);
    setGainedMarks(exam.gainedMarks);
    setExamDate(exam.date || "");
    setIsMain(exam.isMain);
    
    // Scroll form into view
    const formElement = document.getElementById("exam-record-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function handleDeleteExam(id: number) {
    if (editingExamId === id) {
      setEditingExamId(null);
      setExamTitle("");
      setTotalMarks(100);
      setGainedMarks(80);
      setExamDate("");
    }
    setExams((curr) => curr.filter((e) => e.id !== id));
  }

  // Formatting Exam data for Recharts Line Chart
  const chartData = useMemo(() => {
    return exams.map((e) => {
      const percentage = e.totalMarks > 0 ? Math.round((e.gainedMarks / e.totalMarks) * 100) : 0;
      return {
        id: e.id,
        name: e.title,
        percentage,
        isMain: e.isMain,
        tooltipLabel: `${e.title} (${e.isMain ? "Main" : "Quiz"}): ${e.gainedMarks}/${e.totalMarks} (${percentage}%)`,
      };
    });
  }, [exams]);

  const renderCustomDot = (props: { cx?: number; cy?: number; payload?: { id?: number; isMain?: boolean } }) => {
    const { cx, cy, payload } = props;
    if (payload?.isMain) {
      return (
        <g key={payload.id ?? Math.random()}>
          <circle cx={cx} cy={cy} r={9} fill="rgba(244, 63, 94, 0.25)" className="animate-pulse" />
          <circle cx={cx} cy={cy} r={5} fill="#f43f5e" stroke="#ffffff" strokeWidth={1.5} />
        </g>
      );
    }
    return (
      <circle key={payload?.id ?? Math.random()} cx={cx} cy={cy} r={4.5} fill="#64748b" stroke="#0f172a" strokeWidth={1} />
    );
  };

  return (
    <section className="space-y-6 animate-fade-in-up relative">
      <style>{`
        @keyframes breathe-cyan {
          0%, 100% {
            border-color: rgba(6, 182, 212, 0.25);
            box-shadow: 0 0 12px rgba(6, 182, 212, 0.1);
          }
          50% {
            border-color: rgba(6, 182, 212, 0.85);
            box-shadow: 0 0 24px rgba(6, 182, 212, 0.4);
          }
        }
        .active-glow-aura {
          animation: breathe-cyan 3.2s ease-in-out infinite;
        }
      `}</style>
      {/* 20-Point Splash Animation */}
      {showSplash && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md rounded-2xl animate-fade-in">
          <div className="text-center p-8 border border-indigo-500/30 rounded-3xl bg-indigo-950/20 shadow-[0_0_50px_rgba(99,102,241,0.2)] max-w-sm">
            <Award className="h-20 w-20 text-yellow-400 mx-auto animate-bounce" />
            <h2 className="text-3xl font-black text-white mt-4">Tome Mastered!</h2>
            <p className="text-indigo-300 font-bold mt-2">+50 Experience Points</p>
            <p className="text-xs text-slate-400 mt-1">Your scholar&apos;s revision streak has advanced.</p>
          </div>
        </div>
      )}

      {/* Main Header Row */}
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Left header box */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Category icon wrapped in PowerUpBoost */}
              <PowerUpBoost moduleKey="Learning">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--rank-accent)]/30 bg-slate-950/70 shadow-[0_0_28px_rgba(34,211,238,0.2)]">
                  <Award className="h-11 w-11 text-[var(--rank-accent)] filter drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-pulse" />
                </div>
              </PowerUpBoost>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                  Learning Module
                </p>
                <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">
                  STUDY HUB
                </h1>
              </div>
            </div>

            {/* Streak & notification badges */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {/* FireStreak Component */}
              <FireStreak streakValue={smartStreak} streakType="Smart" />

              {notification && (
                <span className="rounded-full border border-[var(--rank-accent)]/25 bg-[var(--rank-accent)]/10 px-4 py-2 text-sm font-semibold text-[var(--rank-accent)]">
                  {notification}
                </span>
              )}
            </div>
          </div>

          {/* Sub-module View Toggles */}
          <div className="mt-6 inline-flex rounded-2xl border border-slate-800 bg-slate-950/55 p-1 w-fit">
            {[
              { id: "table" as const, label: "Study Table", icon: Lamp },
              { id: "vault" as const, label: "Revision Vault", icon: RotateCcw },
              { id: "hub" as const, label: "Exam Hub", icon: GraduationCap },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.1em] transition-all duration-100 active:scale-95 ${
                    activeTab === tab.id
                      ? "bg-[var(--rank-accent)]/15 text-white shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right header widget: High-Stakes Telemetry Countdown Tag */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            High-Stakes Telemetry
          </p>
          <div className="mt-4">
            {nearestMainExam ? (
              <div
                className={`rounded-xl border p-4 transition-all duration-350 ${
                  nearestMainExam.daysLeft < 10
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.15)] animate-pulse"
                    : "border-indigo-500/25 bg-indigo-500/10 text-indigo-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    {nearestMainExam.daysLeft < 10 ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span>
                        </span>
                        Crimson Crisis Alert
                      </>
                    ) : (
                      "Standard Blueprint"
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("hub");
                        handleStartEditExam(nearestMainExam);
                      }}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-955 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                      title="Edit Main Exam"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
                <h3 className="mt-3 text-lg font-black text-white">{nearestMainExam.title}</h3>
                <p className="mt-1 text-sm font-bold">
                  in <span className="text-2xl font-black">{nearestMainExam.daysLeft}</span> Days
                </p>
                <p className="text-[10px] text-slate-400 mt-2">
                  Exam target date: {nearestMainExam.date}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-center text-slate-500 text-sm">
                No upcoming Main Exams registered. Add one in the Exam Hub.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main workspaces switcher viewport */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-sm sm:p-6">
        {/* SUB-MODULE A: STUDY TABLE */}
        {activeTab === "table" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
              {/* Study Intake Log Form */}
              <form
                className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5 flex flex-col justify-between"
                onSubmit={handleAddSession}
              >
                <div>
                  <h3 className="text-lg font-black text-white">Log Study Session</h3>
                  <p className="text-xs text-slate-450 mt-1">Configure subjects studied and duration logs</p>

                  <div className="mt-5 space-y-4">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-505">
                        Subject Name
                      </span>
                      <input
                        className={fieldClass}
                        placeholder="e.g. Advanced Operating Systems"
                        required
                        value={studySubject}
                        onChange={(e) => setStudySubject(e.target.value)}
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Hours
                        </span>
                        <input
                          type="number"
                          min={0}
                          className={fieldClass}
                          value={studyHours}
                          onChange={(e) => setStudyHours(Number(e.target.value))}
                          required
                        />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-505">
                          Minutes
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={59}
                          className={fieldClass}
                          value={studyMinutes}
                          onChange={(e) => setStudyMinutes(Number(e.target.value))}
                          required
                        />
                      </label>
                    </div>

                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Select Day
                      </span>
                      <select
                        className={fieldClass}
                        value={studyDay}
                        onChange={(e) => setStudyDay(e.target.value as DayName)}
                      >
                        {daysOfWeek.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full rounded-xl bg-indigo-650 py-3 text-xs font-black uppercase tracking-wider text-white transition-all duration-100 hover:bg-indigo-600 active:scale-95 cursor-pointer"
                >
                  Add Study Session
                </button>
              </form>

              {/* Study Time Log Dashboard */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Time Log Dashboard</h3>
                  <p className="text-xs text-slate-400 mt-1">Study allocation metrics per weekday</p>

                  <div className="mt-6 space-y-4">
                    {dailyStudyStats.map((stat) => {
                      const maxTarget = 8;
                      const percentage = Math.min(100, (stat.hours / maxTarget) * 100);
                      return (
                        <div key={stat.day} className="group grid grid-cols-[80px_1fr_60px] items-center gap-3">
                          <span className="text-xs font-bold text-slate-400">{stat.day}</span>
                          <div className="h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
                            <div
                              style={{ width: `${percentage}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-[var(--rank-accent)] transition-all duration-500 group-hover:brightness-110 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-350 text-right">
                            {stat.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-800/80">
                  <div className="rounded-xl border border-slate-850 bg-slate-900/30 p-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Total Hours This Week
                    </p>
                    <p className="text-2xl font-black text-white mt-1">
                      {studyMetrics.totalHours} <span className="text-sm font-normal text-slate-400">Hours</span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-850 bg-slate-900/30 p-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Most Studied Subject
                    </p>
                    <p className="text-lg font-black text-white mt-1 truncate" title={studyMetrics.mostStudied}>
                      {studyMetrics.mostStudied}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5">
              <h3 className="text-lg font-black text-white mb-4">Logged Study Ledger</h3>
              {sessions.length === 0 ? (
                <p className="text-sm text-slate-500">No sessions recorded yet.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-slate-100 truncate w-40">{s.subject}</h4>
                        <p className="text-xs text-slate-505 mt-1">{s.day}</p>
                        <p className="text-xs font-mono font-bold text-[var(--rank-accent)] mt-1.5">
                          Duration: {s.hours}h {s.minutes}m
                        </p>
                      </div>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        onClick={() => handleDeleteSession(s.id)}
                        aria-label={`Delete study session`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUB-MODULE B: REVISION VAULT */}
        {activeTab === "vault" && (
          <div className="space-y-6 animate-fade-in">
            <form
              onSubmit={handleAddRevision}
              className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5"
            >
              <h3 className="text-lg font-black text-white">Vault subjects registry</h3>
              <p className="text-xs text-slate-400 mt-1">
                Manually stack study targets into the active recall revision queue
              </p>
              <div className="mt-4 flex gap-3">
                <input
                  className={`${fieldClass} flex-1`}
                  placeholder="e.g. Database Indexing"
                  required
                  value={newRevisionSubject}
                  onChange={(e) => setNewRevisionSubject(e.target.value)}
                />
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-650 px-5 text-xs font-black uppercase tracking-wider text-white hover:bg-indigo-600 transition-colors cursor-pointer active:scale-95 transition-transform"
                >
                  Add Revision Subject
                </button>
              </div>
            </form>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white">Active Recall Board</h3>
                  <p className="text-xs text-slate-405">
                    Complete all items to award +50 points and secure your Tome Streak
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer"
                    onClick={handleDecayStreak}
                  >
                    Simulate Missed Day
                  </button>
                  {allRevisionsChecked && (
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-500 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                      onClick={handleCompleteRevisionCycle}
                    >
                      Collect Reward & Reset
                    </button>
                  )}
                </div>
              </div>

              {revisions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-850 bg-slate-900/10 p-8 text-center text-slate-500 text-sm">
                  Revision queue is empty. Registry a subject above to start active recall.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {revisions.map((rev) => (
                    /* Checkbox Interaction: scale pulse and border glow on active recall cards */
                    <motion.div
                      key={rev.id}
                      animate={rev.checked ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.2 }}
                      className={`relative rounded-xl border p-4 transition-all duration-300 ${
                        rev.checked
                          ? "border-emerald-500/30 bg-emerald-950/5 opacity-55 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                          : "border-slate-800 bg-slate-900/40 hover:border-slate-705"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <label className="flex cursor-pointer items-center justify-center w-5 h-5 rounded border border-slate-700 bg-slate-950 transition-transform active:scale-90">
                          <input
                            type="checkbox"
                            checked={rev.checked}
                            onChange={() => handleToggleRevision(rev.id)}
                            className="h-3.5 w-3.5 accent-[var(--rank-accent)]"
                          />
                        </label>
                        <span
                          className={`text-sm font-bold truncate pr-6 text-slate-205 ${
                            rev.checked ? "line-through text-slate-500" : ""
                          }`}
                        >
                          {rev.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        onClick={() => handleDeleteRevision(rev.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUB-MODULE C: EXAM HUB */}
        {activeTab === "hub" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
              <form
                id="exam-record-form"
                onSubmit={handleSaveExam}
                className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingExamId !== null ? "Edit Exam Record" : "Register Exam Record"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {editingExamId !== null
                      ? "Modify the fields below to update this exam's details"
                      : "Configure historical scores or countdown targets"}
                  </p>

                  <div className="mt-5 space-y-4">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Exam Title
                      </span>
                      <input
                        className={fieldClass}
                        placeholder="e.g. Advanced Algorithms Final"
                        required
                        value={examTitle}
                        onChange={(e) => setExamTitle(e.target.value)}
                      />
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-550">
                        Target Date (Optional for Quizzes)
                      </span>
                      <div className="relative">
                        <input
                          type="date"
                          className={`${fieldClass} w-full pr-10`}
                          value={examDate}
                          onChange={(e) => setExamDate(e.target.value)}
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </label>

                    {/* Important Exam Checkbox Option */}
                    <label className="flex items-center gap-2.5 cursor-pointer mt-1 bg-slate-900/30 border border-slate-850 p-3 rounded-xl transition-all duration-200 hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={isMain}
                        onChange={(e) => setIsMain(e.target.checked)}
                        className="h-4.5 w-4.5 rounded border-slate-750 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-650"
                      />
                      <div className="text-left leading-none">
                        <span className="text-xs font-black text-slate-205 block">IMPORTANT EXAM</span>
                        <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Flags with a purple border (Basic exams are yellow)</span>
                      </div>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Total Marks
                        </span>
                        <input
                          type="number"
                          min={1}
                          required
                          className={fieldClass}
                          value={totalMarks}
                          onChange={(e) => setTotalMarks(Number(e.target.value))}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-505">
                          Gained Marks
                        </span>
                        <input
                          type="number"
                          min={0}
                          required
                          className={fieldClass}
                          value={gainedMarks}
                          onChange={(e) => setGainedMarks(Number(e.target.value))}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-indigo-650 hover:bg-indigo-600 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors cursor-pointer active:scale-[0.97]"
                  >
                    {editingExamId !== null ? "Update Exam Record" : "Register Exam"}
                  </button>
                  {editingExamId !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingExamId(null);
                        setExamTitle("");
                        setTotalMarks(100);
                        setGainedMarks(80);
                        setExamDate("");
                        setIsMain(false);
                      }}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 py-3 text-xs font-black uppercase tracking-wider text-slate-300 transition-colors cursor-pointer active:scale-[0.97]"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>

              {/* Score trajectory graph */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5">
                <h3 className="text-lg font-black text-white">Score Trajectory Graph</h3>
                <p className="text-xs text-slate-400 mt-1">Visual progression path for historical quiz and exam markings</p>

                <div className="h-72 mt-6">
                  {chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
                      No scored records found. Register an exam to display score path.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b50" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#070a13", borderColor: "#1e293b", borderRadius: "12px", fontSize: "11px" }}
                          itemStyle={{ color: "#f8fafc" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="percentage"
                          stroke="var(--rank-accent)"
                          strokeWidth={2.5}
                          dot={renderCustomDot}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Scored ledger tables */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5">
              <h3 className="text-lg font-black text-white mb-4">Historical Records Ledger</h3>
              {exams.length === 0 ? (
                <p className="text-sm text-slate-500">No exams registered yet.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {exams.map((e) => {
                    const percentage = e.totalMarks > 0 ? Math.round((e.gainedMarks / e.totalMarks) * 100) : 0;
                    const isUpcomingMain = (() => {
                      if (!e.isMain || !e.date) return false;
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const examD = new Date(e.date);
                      examD.setHours(0, 0, 0, 0);
                      return examD >= today;
                    })();

                    return (
                      <div
                        key={e.id}
                        className={`rounded-xl border p-4 flex items-center justify-between transition-all duration-300 ${
                          e.isMain
                            ? isUpcomingMain
                              ? "border-purple-500 bg-purple-950/25 shadow-[0_0_15px_rgba(168,85,247,0.22)] animate-pulse"
                              : "border-purple-500/30 bg-purple-950/5 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.06)]"
                            : "border-amber-500/25 bg-amber-950/5 hover:border-amber-500/45 hover:shadow-[0_0_15px_rgba(245,158,11,0.06)]"
                        }`}
                      >
                        <div>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 w-fit transition-all duration-300 ${
                            e.isMain
                              ? isUpcomingMain
                                ? "bg-purple-500/25 text-purple-300 border border-purple-500/35 shadow-[0_0_10px_rgba(168,85,247,0.45)]"
                                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : "bg-amber-500/10 text-amber-450 border border-amber-500/20"
                          }`}>
                            {e.isMain ? (
                              <>
                                <Calendar className="h-2.5 w-2.5" />
                                <span>Important Exam</span>
                              </>
                            ) : (
                              <span>Basic Exam</span>
                            )}
                          </span>
                          <h4 className="font-bold text-slate-100 mt-2 truncate w-40" title={e.title}>
                            {e.title}
                          </h4>
                          {e.date && <p className="text-[10px] text-slate-500 mt-0.5">Date: {e.date}</p>}
                          {isUpcomingMain ? (
                            <p className="text-xs font-bold text-purple-400 mt-2 flex items-center gap-1">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-450 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
                              </span>
                              Scheduled
                            </p>
                          ) : (
                            <p className="text-xs font-mono font-black text-slate-300 mt-2">
                              Score: <span className={percentage >= 80 ? "text-emerald-400" : percentage >= 50 ? "text-amber-450" : "text-rose-450"}>
                                {e.gainedMarks}/{e.totalMarks} ({percentage}%)
                              </span>
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                            onClick={() => handleStartEditExam(e)}
                            aria-label={`Edit exam record`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-800 bg-slate-955 p-2 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            onClick={() => handleDeleteExam(e.id)}
                            aria-label={`Delete exam record`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
