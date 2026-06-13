"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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

export type ModuleKey = "Dashboard" | "Workout" | "Food" | "Learning" | "Money" | "Tasks";

export const defaultWidgets = [
  "Workout Consistency Radial Chart",
  "Weekly Task Execution Bar Chart",
  "Fuel Target Progress Gauges",
  "Category Expense Pie Chart",
  "Net Worth Area Spline",
  "Academic Trajectory Line Chart",
];

interface NectState {
  points: number;
  powerStreak: number;
  smartStreak: number;
  healthyStreak: number;
  lockRankTheme: boolean;
  rankOverride: string;
  autoApproveTransactions: boolean;
  visibleModules: Record<ModuleKey, boolean>;
  widgetOrder: string[];
  activeBoosts: Record<string, number>; // Maps module key to expiration timestamp (ms)
  peakMentalPowerUntil: number | null; // Timestamp until which peak mental power is active
  
  // Rank-up display trigger state
  prevPoints: number;
  showRankUpOverlay: boolean;
  rankUpFrom: string;
  rankUpTo: string;
  dismissRankUp: () => void;

  // Actions
  awardPoints: (amount: number, sourceModule?: string) => void;
  triggerPeakMentalPower: () => void;
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
  resetAll: () => void;
}

export const useNectStore = create<NectState>()(
  persist(
    (set, get) => ({
      points: 12840,
      powerStreak: 5,
      smartStreak: 7,
      healthyStreak: 3,
      lockRankTheme: true,
      rankOverride: "Sorcerer",
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
      activeBoosts: {},
      peakMentalPowerUntil: null,

      prevPoints: 12840,
      showRankUpOverlay: false,
      rankUpFrom: "",
      rankUpTo: "",

      dismissRankUp: () => set({ showRankUpOverlay: false }),

      awardPoints: (amount, sourceModule) => {
        const state = get();
        let multiplier = 1;
        
        if (sourceModule && state.activeBoosts[sourceModule]) {
          const now = Date.now();
          if (now < state.activeBoosts[sourceModule]) {
            multiplier = 1.02; // 2% XP multiplier
          }
        }

        const calculatedAmount = Math.round(amount * multiplier);
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

      activateBoost: (module, durationMs) => {
        set((state) => ({
          activeBoosts: {
            ...state.activeBoosts,
            [module]: Date.now() + durationMs,
          },
        }));
      },

      resetAll: () =>
        set({
          points: 12840,
          powerStreak: 5,
          smartStreak: 7,
          healthyStreak: 3,
          lockRankTheme: true,
          rankOverride: "Sorcerer",
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
          activeBoosts: {},
          peakMentalPowerUntil: null,
          showRankUpOverlay: false,
        }),
    }),
    {
      name: "nect-global-store",
      partialize: (state) => ({
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
      }),
    }
  )
);
