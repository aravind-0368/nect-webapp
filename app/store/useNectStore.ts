"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CurrencyInfo {
  country: string;
  name: string;
  code: string;
  symbol: string;
  flag: string;
}

export const currenciesList: CurrencyInfo[] = [
  { flag: "🇮🇳", country: "India", name: "Indian Rupee", code: "INR", symbol: "₹" },
  { flag: "🇺🇸", country: "USA", name: "United States Dollar", code: "USD", symbol: "$" },
  { flag: "🇫🇷", country: "France", name: "Euro", code: "EUR", symbol: "€" },
  { flag: "🇮🇩", country: "Indonesia", name: "Indonesian Rupiah", code: "IDR", symbol: "Rp" },
  { flag: "🇦🇪", country: "UAE", name: "UAE Dirham", code: "AED", symbol: "د.إ" },
  { flag: "🇱🇰", country: "Sri Lanka", name: "Sri Lankan Rupee", code: "LKR", symbol: "₨" },
  { flag: "🇯🇵", country: "Japan", name: "Japanese Yen", code: "JPY", symbol: "¥" },
  { flag: "🇨🇳", country: "China", name: "Chinese Yuan (Renminbi)", code: "CNY", symbol: "¥" },
  { flag: "🇷🇺", country: "Russia", name: "Russian Ruble", code: "RUB", symbol: "₽" },
  { flag: "🇰🇷", country: "South Korea", name: "South Korean Won", code: "KRW", symbol: "₩" },
];

export const getCurrencySymbol = (code: string): string => {
  const found = currenciesList.find((c) => c.code === code);
  return found ? found.symbol : "$";
};

export interface RankTier {
  name: string;
  min: number;
  max: number;
  color: string;
  description: string;
}

export const rankTiers: RankTier[] = [
  { name: "E-Rank", min: 0, max: 500, color: "#FFFFFF", description: "The Awakening: A full-body skeleton silhouette clawing its way out of the grid matrix." },
  { name: "D-Rank", min: 501, max: 1500, color: "#22C55E", description: "The Awakening: A robed healer holding a staff pulsing with restorative energy." },
  { name: "C-Rank", min: 1501, max: 3500, color: "#EAB308", description: "The Awakening: A spark mage cradling active vector fire." },
  { name: "B-Rank", min: 3501, max: 6000, color: "#EF4444", description: "The Ascended Elite: A flying Chinese dragon looping dynamically." },
  { name: "A-Rank", min: 6001, max: 10000, color: "#06B6D4", description: "The Ascended Elite: A citadel knight visor with heavy shoulder armor plating." },
  { name: "S-Rank", min: 10001, max: Infinity, color: "#D946EF", description: "The Supreme Echelon: A cosmic monarch's crown collapsing into spinning vector rings." }
];

export function getActiveRank(points: number): RankTier {
  return rankTiers.find((tier) => points >= tier.min && points <= tier.max) || rankTiers[0];
}

export type ModuleKey = "Dashboard" | "Workout" | "Food" | "Learning" | "Money" | "Tasks";

export const defaultWidgets = [
  "Resource Flow",
  "Workout Chart",
  "Study Chart",
  "Task Board",
  "Sleep Cycle Tracker",
  "Category Spending breakdown",
  "Weight & Height Tracker"
];

interface NectState {
  userId: string | null;
  points: number;
  powerStreak: number;
  smartStreak: number;
  healthyStreak: number;
  lockRankTheme: boolean;
  rankOverride: string;
  autoApproveTransactions: boolean;
  visibleModules: Record<ModuleKey, boolean>;
  widgetOrder: string[];
  currency: string;
  activeBoosts: Record<string, number>; // Maps module key to expiration timestamp (ms)
  peakMentalPowerUntil: number | null; // Timestamp until which peak mental power is active
  lastMainExamCompletedAt: number | null;
  lastMainExamScore: number | null;
  lastMainExamTitle: string | null;
  
  // Rank-up display trigger state
  prevPoints: number;
  showRankUpOverlay: boolean;
  rankUpFrom: string;
  rankUpTo: string;
  dismissRankUp: () => void;

  setUserId: (val: string | null) => void;
  setPoints: (val: number) => void;

  // Actions
  awardPoints: (amount: number, sourceModule?: string) => void;
  triggerPeakMentalPower: () => void;
  setLastMainExam: (completedAt: number | null, score: number | null, title: string | null) => void;
  setPowerStreak: (val: number) => void;
  setSmartStreak: (val: number) => void;
  setHealthyStreak: (val: number) => void;
  incrementPowerStreak: () => void;
  incrementSmartStreak: () => void;
  incrementHealthyStreak: () => void;
  decayPowerStreak: () => void;
  decaySmartStreak: () => void;
  decayHealthyStreak: () => void;
  setLockRankTheme: (val: boolean) => void;
  setRankOverride: (val: string) => void;
  setAutoApproveTransactions: (val: boolean) => void;
  setVisibleModules: (modules: Record<ModuleKey, boolean>) => void;
  toggleModule: (module: ModuleKey) => void;
  setWidgetOrder: (order: string[]) => void;
  activateBoost: (module: string, durationMs: number) => void;
  setCurrency: (val: string) => void;
  resetAll: () => void;
}

export const useNectStore = create<NectState>()(
  persist(
    (set, get) => ({
      userId: null,
      points: 0,
      powerStreak: 0,
      smartStreak: 0,
      healthyStreak: 0,
      lockRankTheme: true,
      rankOverride: "E-Rank",
      autoApproveTransactions: true,
      visibleModules: {
        Dashboard: true,
        Workout: true,
        Food: true,
        Learning: true,
        Money: true,
        Tasks: true,
      },
      widgetOrder: defaultWidgets,
      currency: "USD",
      activeBoosts: {},
      peakMentalPowerUntil: null,
      lastMainExamCompletedAt: null,
      lastMainExamScore: null,
      lastMainExamTitle: null,

      prevPoints: 0,
      showRankUpOverlay: false,
      rankUpFrom: "",
      rankUpTo: "",

      dismissRankUp: () => set({ showRankUpOverlay: false }),
      setUserId: (val) => set({ userId: val }),
      setPoints: (val) => set({ points: val }),

      awardPoints: (amount, sourceModule) => {
        const state = get();
        const isReversion = amount < 0;
        const baseAmount = Math.abs(amount);

        // 1. Get streak for the module
        let streakValue = 0;
        if (sourceModule === "Workout") {
          streakValue = state.powerStreak;
        } else if (sourceModule === "Learning") {
          streakValue = state.smartStreak;
        } else if (sourceModule === "Food") {
          streakValue = state.healthyStreak;
        } else {
          streakValue = Math.max(state.powerStreak, state.smartStreak, state.healthyStreak);
        }

        // 2. Calculate overdrive streak bonus: +10 XP for every 50-day streak
        const streakBonus = Math.floor(streakValue / 50) * 10;

        // 3. Apply base + bonus and cap it at 40 max ceiling (unless it's 0)
        let finalXp = baseAmount;
        if (baseAmount > 0) {
          finalXp = Math.min(baseAmount + streakBonus, 40);
        }

        // 4. Apply active boost multiplier (2% boost)
        let multiplier = 1;
        if (sourceModule && state.activeBoosts[sourceModule]) {
          const now = Date.now();
          if (now < state.activeBoosts[sourceModule]) {
            multiplier = 1.02;
          }
        }

        const calculatedAmount = Math.round(finalXp * multiplier) * (isReversion ? -1 : 1);
        const newPoints = Math.max(0, state.points + calculatedAmount);

        const oldRank = getActiveRank(state.points);
        const newRank = getActiveRank(newPoints);

        const rankIncreased = newRank.min > oldRank.min;

        set({
          points: newPoints,
          prevPoints: state.points,
          showRankUpOverlay: rankIncreased ? true : state.showRankUpOverlay,
          rankUpFrom: rankIncreased ? oldRank.name : state.rankUpFrom,
          rankUpTo: rankIncreased ? newRank.name : state.rankUpTo,
        });
      },

      triggerPeakMentalPower: () => {
        const fortyEightHoursInMs = 48 * 60 * 60 * 1000;
        set({ peakMentalPowerUntil: Date.now() + fortyEightHoursInMs });
      },

      setLastMainExam: (completedAt, score, title) => {
        set({
          lastMainExamCompletedAt: completedAt,
          lastMainExamScore: score,
          lastMainExamTitle: title,
        });
      },

      setPowerStreak: (val) => set({ powerStreak: val }),
      setSmartStreak: (val) => set({ smartStreak: val }),
      setHealthyStreak: (val) => set({ healthyStreak: val }),

      incrementPowerStreak: () => set((state) => ({ powerStreak: state.powerStreak + 1 })),
      incrementSmartStreak: () => set((state) => ({ smartStreak: state.smartStreak + 1 })),
      incrementHealthyStreak: () => set((state) => ({ healthyStreak: state.healthyStreak + 1 })),

      decayPowerStreak: () => set({ powerStreak: 0 }),
      decaySmartStreak: () => set({ smartStreak: 0 }),
      decayHealthyStreak: () => set({ healthyStreak: 0 }),

      setLockRankTheme: (val) => set({ lockRankTheme: val }),
      setRankOverride: (val) => set({ rankOverride: val }),
      setAutoApproveTransactions: (val) => set({ autoApproveTransactions: val }),
      setVisibleModules: (modules) => set({ visibleModules: modules }),
      toggleModule: (module) =>
        set((state) => {
          const nextVisible = {
            ...state.visibleModules,
            [module]: !state.visibleModules[module],
          };
          return { visibleModules: nextVisible };
        }),

      setWidgetOrder: (order) => set({ widgetOrder: order }),

      setCurrency: (val) => set({ currency: val }),

      activateBoost: (module, durationMs) => {
        set((state) => ({
          activeBoosts: {
            ...state.activeBoosts,
            [module]: Date.now() + durationMs,
          },
        }));
      },

      resetAll: () => {
        if (typeof window !== "undefined") {
          const keys = Object.keys(localStorage);
          keys.forEach((key) => {
            if (key.startsWith("nect_") && key !== "nect-global-store") {
              localStorage.removeItem(key);
            }
          });
        }
        set({
          userId: null,
          points: 0,
          powerStreak: 0,
          smartStreak: 0,
          healthyStreak: 0,
          lockRankTheme: true,
          rankOverride: "E-Rank",
          autoApproveTransactions: true,
          visibleModules: {
            Dashboard: true,
            Workout: true,
            Food: true,
            Learning: true,
            Money: true,
            Tasks: true,
          },
          widgetOrder: defaultWidgets,
          currency: "USD",
          activeBoosts: {},
          peakMentalPowerUntil: null,
          lastMainExamCompletedAt: null,
          lastMainExamScore: null,
          lastMainExamTitle: null,
          showRankUpOverlay: false,
        });
      },
    }),
    {
      name: "nect-global-store",
      partialize: (state) => ({
        userId: state.userId,
        points: state.points,
        powerStreak: state.powerStreak,
        smartStreak: state.smartStreak,
        healthyStreak: state.healthyStreak,
        lockRankTheme: state.lockRankTheme,
        rankOverride: state.rankOverride,
        autoApproveTransactions: state.autoApproveTransactions,
        visibleModules: state.visibleModules,
        widgetOrder: state.widgetOrder,
        peakMentalPowerUntil: state.peakMentalPowerUntil,
        lastMainExamCompletedAt: state.lastMainExamCompletedAt,
        lastMainExamScore: state.lastMainExamScore,
        lastMainExamTitle: state.lastMainExamTitle,
        currency: state.currency,
      }),
    }
  )
);
