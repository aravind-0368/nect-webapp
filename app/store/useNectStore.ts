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
  "Resource Flow Engine",
  "Cognitive Synaptic Gateway",
  "Skill Matrix Hub",
  "Kinetic Overdrive Matrix",
  "Bounty Board Nodes"
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
  lastMainExamCompletedAt: number | null;
  lastMainExamScore: number | null;
  lastMainExamTitle: string | null;
  
  // Rank-up display trigger state
  prevPoints: number;
  showRankUpOverlay: boolean;
  rankUpFrom: string;
  rankUpTo: string;
  dismissRankUp: () => void;

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
      rankOverride: "S-Rank",
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
      lastMainExamCompletedAt: null,
      lastMainExamScore: null,
      lastMainExamTitle: null,

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
          rankOverride: "S-Rank",
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
          lastMainExamCompletedAt: null,
          lastMainExamScore: null,
          lastMainExamTitle: null,
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
        lastMainExamCompletedAt: state.lastMainExamCompletedAt,
        lastMainExamScore: state.lastMainExamScore,
        lastMainExamTitle: state.lastMainExamTitle,
      }),
    }
  )
);
