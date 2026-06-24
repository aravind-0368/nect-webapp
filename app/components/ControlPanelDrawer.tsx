"use client";

import { useState, useMemo, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Eye, EyeOff, Sliders, LogOut, Lock, AlertTriangle, 
  GripVertical, User, Settings, AlertCircle, LayoutGrid, Zap 
} from "lucide-react";
import { useNectStore, rankTiers, getActiveRank, ModuleKey } from "../store/useNectStore";

interface ControlPanelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function ControlPanelDrawer({ isOpen, onClose, onLogout }: ControlPanelDrawerProps) {
  const {
    points,
    powerStreak,
    smartStreak,
    healthyStreak,
    lockRankTheme,
    rankOverride,
    autoApproveTransactions,
    visibleModules,
    widgetOrder,
    setLockRankTheme,
    setRankOverride,
    setAutoApproveTransactions,
    toggleModule,
    setWidgetOrder,
    resetAll
  } = useNectStore();

  const activeRank = useMemo(() => getActiveRank(points), [points]);
  const accentColor = lockRankTheme ? activeRank.color : rankTiers.find(t => t.name === rankOverride)?.color || activeRank.color;

  // Tabs: "profile" | "settings"
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");

  // Profile Form States
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [password, setPassword] = useState("nect-rank-1240");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Modals States
  const [showWorkoutWarning, setShowWorkoutWarning] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteInputText, setDeleteInputText] = useState("");

  // Drag and Drop State for widget reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Filter legacy ranks to only previously conquered ones (current Rank or below)
  const conqueredRanks = useMemo(() => {
    return rankTiers.filter((tier) => points >= tier.min);
  }, [points]);

  const isWidgetVisible = (widgetName: string) => {
    if (widgetName === "Resource Flow Engine") return visibleModules.Money;
    if (widgetName === "Cognitive Synaptic Gateway") return visibleModules.Learning;
    if (widgetName === "Skill Matrix Hub") return visibleModules.Learning;
    if (widgetName === "Kinetic Overdrive Matrix") return visibleModules.Workout;
    if (widgetName === "Bounty Board Nodes") return visibleModules.Tasks;
    return true;
  };

  const handleSavePassword = (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    setPassword(newPassword);
    setNewPassword("");
    setConfirmPassword("");
    setChangingPassword(false);
    alert("Password updated locally.");
  };

  const handleToggleModuleWithWarning = (module: ModuleKey) => {
    if (module === "Workout" && visibleModules.Workout) {
      // Show custom warning modal instead of standard alert
      setShowWorkoutWarning(true);
    } else {
      toggleModule(module);
    }
  };

  const handleConfirmDisableWorkout = () => {
    toggleModule("Workout");
    setShowWorkoutWarning(false);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    const newOrder = [...widgetOrder];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);
    setWidgetOrder(newOrder);
    setDraggedIndex(null);
  };

  const handleDeleteAccount = () => {
    if (deleteInputText === "DELETE") {
      localStorage.clear();
      resetAll();
      setShowDeleteConfirmation(false);
      onLogout();
      alert("Local prototype data cleared.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Translucent backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-955/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Sliding drawer layout */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
            className="relative flex h-full w-[90vw] max-w-[850px] flex-col border-l border-slate-800 bg-slate-950/95 shadow-2xl backdrop-blur-md"
            style={{
              borderColor: `${accentColor}30`,
              boxShadow: `0 0 50px ${accentColor}10`
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5" style={{ color: accentColor }} />
                <h2 className="text-lg font-black uppercase tracking-wider text-slate-100">
                  Control Panel
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Split Content Viewports */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left pane: Navigation Sidebar */}
              <aside className="w-[180px] shrink-0 border-r border-slate-900 bg-slate-950/50 p-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("profile")}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-left text-xs font-black uppercase tracking-wider transition-all duration-100 active:scale-95 cursor-pointer ${
                      activeTab === "profile"
                        ? "bg-slate-900 text-white border border-slate-800"
                        : "text-slate-450 hover:bg-slate-900/50 hover:text-slate-200"
                    }`}
                    style={{
                      borderLeft: activeTab === "profile" ? `3px solid ${accentColor}` : undefined
                    }}
                  >
                    <User className="h-4 w-4" style={{ color: activeTab === "profile" ? accentColor : undefined }} />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("settings")}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-left text-xs font-black uppercase tracking-wider transition-all duration-100 active:scale-95 cursor-pointer ${
                      activeTab === "settings"
                        ? "bg-slate-900 text-white border border-slate-800"
                        : "text-slate-450 hover:bg-slate-900/50 hover:text-slate-200"
                    }`}
                    style={{
                      borderLeft: activeTab === "settings" ? `3px solid ${accentColor}` : undefined
                    }}
                  >
                    <Sliders className="h-4 w-4" style={{ color: activeTab === "settings" ? accentColor : undefined }} />
                    Settings
                  </button>
                </div>

                {/* Persistent Logout button at base of Left Pane */}
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 py-3 text-xs font-black uppercase tracking-wider text-rose-300 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </aside>

              {/* Right pane: Content Viewport */}
              <main className="flex-1 overflow-y-auto p-6 bg-slate-950/20">
                {activeTab === "profile" ? (
                  /* PROFILE PANEL */
                  <div className="space-y-6">
                    {/* Identity Block */}
                    <div className="rounded-2xl border border-slate-850 bg-slate-900/40 p-5 backdrop-blur-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-450">
                        Active Cosmic Identity
                      </p>
                      <h3 className="mt-2 text-2xl font-black text-white">Aravind</h3>
                      <p className="text-xs font-semibold text-slate-450 mt-0.5">aravind@nect.local</p>
                      
                      <div className="mt-5 grid gap-3 grid-cols-2">
                        <div className="rounded-xl border border-slate-850 bg-slate-950/60 p-4 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rank Title</span>
                            <p className="mt-1.5 text-base font-black uppercase tracking-wider leading-tight" style={{ color: activeRank.color }}>
                              {activeRank.name}
                            </p>
                          </div>
                          <img
                            src={`/assets/ranks/${activeRank.name.toLowerCase()}.svg`}
                            alt={`${activeRank.name} Rank Badge`}
                            className="h-10 w-10 object-contain ml-2"
                          />
                        </div>
                        <div className="rounded-xl border border-slate-850 bg-slate-950/60 p-4">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Points</span>
                          <p className="mt-1.5 text-base font-black text-white">
                            {points.toLocaleString()} <span className="text-2xs text-slate-500 font-semibold">XP</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Streaks Summary Card */}
                    <div className="rounded-2xl border border-slate-850 bg-slate-900/40 p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                        Streak Metrics
                      </p>
                      <div className="mt-4 grid gap-3 grid-cols-3 text-center text-xs">
                        <div className="rounded-xl bg-slate-950/50 p-3 border border-slate-850">
                          <span className="text-slate-500 font-bold uppercase block text-2xs">Workout</span>
                          <span className="font-black text-white text-base block mt-1">{powerStreak}d</span>
                        </div>
                        <div className="rounded-xl bg-slate-950/50 p-3 border border-slate-850">
                          <span className="text-slate-500 font-bold uppercase block text-2xs">Learning</span>
                          <span className="font-black text-white text-base block mt-1">{smartStreak}d</span>
                        </div>
                        <div className="rounded-xl bg-slate-950/50 p-3 border border-slate-850">
                          <span className="text-slate-500 font-bold uppercase block text-2xs">Food</span>
                          <span className="font-black text-white text-base block mt-1">{healthyStreak}d</span>
                        </div>
                      </div>
                    </div>

                    {/* Security Credentials */}
                    <div className="rounded-2xl border border-slate-850 bg-slate-900/40 p-5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                          Security Details
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-955 p-3 rounded-xl border border-slate-850">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</p>
                          <p className="mt-1 font-mono text-sm font-semibold text-slate-300">
                            {showPassword ? password : "••••••••••••"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-xl border border-slate-800 bg-slate-900/40 p-2 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            type="button"
                            className="rounded-xl border border-slate-700 hover:border-slate-500 px-3 py-1.5 text-2xs font-black uppercase tracking-wider text-slate-200 transition-all cursor-pointer active:scale-95"
                            onClick={() => setChangingPassword(!changingPassword)}
                          >
                            Change
                          </button>
                        </div>
                      </div>

                      {changingPassword && (
                        <form className="mt-4 space-y-3 p-4 bg-slate-950/30 rounded-xl border border-dashed border-slate-800" onSubmit={handleSavePassword}>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <input
                              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs outline-none focus:border-indigo-500 transition-all text-slate-100 placeholder:text-slate-600"
                              placeholder="New Password"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required
                            />
                            <input
                              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs outline-none focus:border-indigo-500 transition-all text-slate-100 placeholder:text-slate-600"
                              placeholder="Confirm New Password"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setChangingPassword(false)}
                              className="rounded-lg border border-slate-800 px-3 py-2 text-2xs font-bold uppercase text-slate-400 hover:text-white cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-2xs font-black uppercase text-white cursor-pointer active:scale-95 transition-all"
                            >
                              Save Password
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                ) : (
                  /* SETTINGS PANEL */
                  <div className="space-y-6">
                    {/* Rank Theme Lock */}
                    <div className="rounded-2xl border border-slate-850 bg-slate-900/40 p-5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <Lock className="h-4 w-4" style={{ color: accentColor }} /> Rank Theme Lock
                      </h4>
                      <p className="text-2xs text-slate-500 mt-0.5">
                        Theme boundaries lock to active rank, or use options unlocked in earlier tiers.
                      </p>

                      <div className="mt-4 flex w-full items-center justify-between gap-4 rounded-xl border border-slate-850 bg-slate-950/60 p-3">
                        <span className="text-xs font-bold text-slate-200">Lock Theme to Active Rank</span>
                        <button
                          type="button"
                          onClick={() => setLockRankTheme(!lockRankTheme)}
                          className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                            lockRankTheme ? "bg-[var(--rank-accent)]" : "bg-slate-800"
                          }`}
                          style={{
                            backgroundColor: lockRankTheme ? accentColor : undefined
                          }}
                        >
                          <span
                            className={`h-5 w-5 rounded-full bg-white transition-transform ${
                              lockRankTheme ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {rankTiers.map((rank) => {
                          const isConquered = points >= rank.min;
                          const isSelected = !lockRankTheme && rankOverride === rank.name;
                          return (
                            <button
                              key={rank.name}
                              type="button"
                              disabled={lockRankTheme || !isConquered}
                              onClick={() => setRankOverride(rank.name)}
                              className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-300 text-center select-none cursor-pointer ${
                                lockRankTheme 
                                  ? "opacity-30 cursor-not-allowed border-slate-900 bg-slate-950/10 text-slate-600" 
                                  : !isConquered
                                    ? "opacity-45 border-slate-900 bg-slate-950/20 text-slate-600 cursor-not-allowed"
                                    : isSelected
                                      ? "bg-slate-900/60 border-slate-700 text-white scale-[1.02]"
                                      : "bg-slate-950/40 border-slate-850 hover:border-slate-750 text-slate-400 hover:text-slate-200"
                              }`}
                              style={{
                                borderColor: isSelected ? rank.color : undefined,
                                boxShadow: isSelected ? `0 0 15px ${rank.color}35` : undefined
                              }}
                            >
                              {/* Color bubble / Lock icon */}
                              <div className="flex items-center justify-center mb-2">
                                {isConquered ? (
                                  <div 
                                    className="h-4.5 w-4.5 rounded-full border border-white/10 transition-transform duration-300"
                                    style={{ 
                                      backgroundColor: rank.color,
                                      boxShadow: isSelected ? `0 0 10px ${rank.color}` : `0 0 4px ${rank.color}50`
                                    }}
                                  />
                                ) : (
                                  <Lock className="h-3.5 w-3.5 text-slate-650" />
                                )}
                              </div>

                              <span className="text-[10px] font-black uppercase tracking-wider block">
                                {rank.name}
                              </span>
                              
                              <span className="text-[8px] font-mono font-bold text-slate-500 uppercase mt-0.5">
                                {isConquered ? "Conquered" : "Locked"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Drag and Drop Widget Reordering Grid */}
                    <div className="rounded-2xl border border-slate-850 bg-slate-900/40 p-5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" style={{ color: accentColor }} /> Widget Arrangement Grid
                      </h4>
                      <p className="text-2xs text-slate-500 mt-0.5 mb-4">
                        Drag and drop items to reindex positions for dashboard cards.
                      </p>

                      <div className="space-y-2">
                        {widgetOrder.map((widget, idx) => {
                          if (!isWidgetVisible(widget)) return null;
                          return (
                            <div
                              key={widget}
                              draggable
                              onDragStart={() => handleDragStart(idx)}
                              onDragOver={(e) => handleDragOver(e, idx)}
                              onDrop={() => handleDrop(idx)}
                              className={`flex items-center gap-3 rounded-xl border p-3 bg-slate-950/60 transition-all cursor-move active:scale-[0.99] select-none ${
                                draggedIndex === idx 
                                  ? "border-indigo-500/50 bg-indigo-500/5 opacity-50" 
                                  : "border-slate-850 hover:border-slate-700"
                              }`}
                            >
                              <GripVertical className="h-4 w-4 text-slate-650 shrink-0" />
                              <span className="text-xs font-bold text-slate-200 flex-1">{widget}</span>
                              <span className="text-[10px] font-black text-slate-500 uppercase">
                                Pos {idx + 1}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* System Visibility Matrix */}
                    <div className="rounded-2xl border border-slate-850 bg-slate-900/40 p-5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <Eye className="h-4 w-4" style={{ color: accentColor }} /> System Visibility Matrix
                      </h4>
                      <p className="text-2xs text-slate-500 mt-0.5 mb-4">
                        Checklist controls for surfacing workspaces. Disabling modules halts dashboard logs.
                      </p>

                      <div className="grid gap-2 grid-cols-2">
                        {(["Dashboard", "Workout", "Food", "Learning", "Money", "Tasks"] as ModuleKey[]).map((module) => (
                          <label
                            key={module}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs font-bold transition-all active:scale-[0.97] ${
                              module === "Dashboard" 
                                ? "border-slate-850 bg-slate-950/20 opacity-40 cursor-not-allowed text-slate-500" 
                                : "border-slate-850 bg-slate-950/60 text-slate-200 hover:border-slate-700"
                            }`}
                          >
                            <span>Enable {module}</span>
                            <input
                              type="checkbox"
                              checked={visibleModules[module]}
                              disabled={module === "Dashboard"}
                              onChange={() => handleToggleModuleWithWarning(module)}
                              className="h-4 w-4 rounded accent-indigo-550 cursor-pointer"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Automation Settings */}
                    <div className="rounded-2xl border border-slate-850 bg-slate-900/40 p-5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <Zap className="h-4 w-4" style={{ color: accentColor }} /> Automation Bypass Roster
                      </h4>
                      <p className="text-2xs text-slate-500 mt-0.5">
                        Leverage bypass controls for transaction confirm gates.
                      </p>

                      <div className="mt-4 flex w-full items-center justify-between gap-4 rounded-xl border border-slate-850 bg-slate-950/60 p-3">
                        <span className="text-xs font-bold text-slate-200">Auto-Approve Recurring Items</span>
                        <button
                          type="button"
                          onClick={() => setAutoApproveTransactions(!autoApproveTransactions)}
                          className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                            autoApproveTransactions ? "bg-[var(--rank-accent)]" : "bg-slate-800"
                          }`}
                          style={{
                            backgroundColor: autoApproveTransactions ? accentColor : undefined
                          }}
                        >
                          <span
                            className={`h-5 w-5 rounded-full bg-white transition-transform ${
                              autoApproveTransactions ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* High-severity Purge Button */}
                    <div className="border-t border-slate-900 pt-5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteInputText("");
                          setShowDeleteConfirmation(true);
                        }}
                        className="rounded-xl border border-rose-500/40 bg-rose-950/20 px-4 py-2.5 text-2xs font-black uppercase tracking-widest text-rose-300 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </motion.div>

          {/* Modal 1: Workout Module Dependency Interceptor Modal */}
          <AnimatePresence>
            {showWorkoutWarning && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowWorkoutWarning(false)}
                  className="absolute inset-0 bg-slate-955/75 backdrop-blur-sm cursor-pointer"
                />
                
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="relative max-w-md w-full rounded-2xl border border-amber-500/35 bg-slate-900 p-6 shadow-2xl z-10 text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4 animate-pulse">
                    <AlertTriangle className="h-6 w-6" />
                  </div>

                  <h3 className="text-base font-black uppercase text-slate-100 tracking-wider">
                    Dependency Intercept Warning
                  </h3>
                  
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">
                    Disabling the Workout module will interrupt automated metric handshakes. The Food module&apos;s target calculations will switch to static defaults.
                  </p>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowWorkoutWarning(false)}
                      className="flex-1 rounded-xl border border-slate-800 bg-slate-950/50 py-3 text-2xs font-black uppercase tracking-wider text-slate-400 hover:text-white cursor-pointer active:scale-97 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDisableWorkout}
                      className="flex-1 rounded-xl bg-amber-600 hover:bg-amber-500 py-3 text-2xs font-black uppercase tracking-wider text-slate-950 cursor-pointer active:scale-97 transition-all"
                    >
                      Confirm Disable
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Modal 2: High-Severity Delete Account Purge Modal */}
          <AnimatePresence>
            {showDeleteConfirmation && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="absolute inset-0 bg-slate-955/75 backdrop-blur-sm cursor-pointer"
                />
                
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="relative max-w-md w-full rounded-2xl border border-rose-500/35 bg-slate-900 p-6 shadow-2xl z-10 text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-450 mb-4 animate-bounce">
                    <AlertCircle className="h-6 w-6" />
                  </div>

                  <h3 className="text-base font-black uppercase text-rose-300 tracking-wider">
                    CRITICAL DATA PURGE WARNING
                  </h3>
                  
                  <p className="mt-2 text-2xs leading-relaxed text-slate-450">
                    This action will permanently erase all local prototype logs, workout metrics, budget transactions, and streak configurations. This is irreversible.
                  </p>

                  <div className="mt-4 text-left flex flex-col gap-1.5">
                    <label htmlFor="purgeInput" className="text-2xs font-bold uppercase tracking-wider text-slate-550">
                      Type <span className="font-black text-rose-400">DELETE</span> to authorize purge
                    </label>
                    <input
                      id="purgeInput"
                      type="text"
                      value={deleteInputText}
                      onChange={(e) => setDeleteInputText(e.target.value)}
                      placeholder="Type DELETE"
                      className="w-full rounded-xl border border-rose-500/20 bg-slate-950 px-4 py-3 text-xs outline-none focus:border-rose-500 text-slate-100 text-center"
                    />
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirmation(false)}
                      className="flex-1 rounded-xl border border-slate-800 bg-slate-950/55 py-3 text-2xs font-black uppercase tracking-wider text-slate-400 hover:text-white cursor-pointer active:scale-97 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={deleteInputText !== "DELETE"}
                      onClick={handleDeleteAccount}
                      className="flex-1 rounded-xl bg-rose-650 disabled:bg-slate-800 disabled:text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-600 py-3 text-2xs font-black uppercase tracking-wider text-white cursor-pointer active:scale-97 transition-all"
                    >
                      Purge Everything
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
