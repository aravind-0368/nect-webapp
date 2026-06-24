"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState, useEffect } from "react";
import { Droplet, Plus, Trash2, PlusCircle, Beef, Zap, Flame, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { useNectStore } from "../store/useNectStore";
import { FireStreak } from "./FireStreak";
import { PowerUpBoost } from "./PowerUpBoost";

type ServingUnitType = "Grams" | "Bowls" | "Whole Fruit" | "Milliliters" | "Scoops";

type PlateItem = {
  id: number;
  name: string;
  servingUnit: ServingUnitType;
  quantity: number;
  calories: number;
  protein: number;
  fiber: number;
  checked: boolean;
};

type SearchResult = {
  id: string;
  name: string;
  brand: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  fiberPer100g: number;
};

const initialPlateItems: PlateItem[] = [
  {
    id: 1,
    name: "Rolled Oats",
    servingUnit: "Bowls",
    quantity: 1.5,
    calories: 150,
    protein: 5,
    fiber: 4,
    checked: true,
  },
  {
    id: 2,
    name: "Banana",
    servingUnit: "Whole Fruit",
    quantity: 1,
    calories: 105,
    protein: 1.3,
    fiber: 3,
    checked: false,
  },
];

const fieldClass =
  "rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500";

type FoodModuleProps = {
  weight?: number;
  setWeight?: (w: number) => void;
  height?: number;
  setHeight?: (h: number) => void;
  workoutEnabled?: boolean;
  age?: number;
  setAge?: (a: number) => void;
  biologicalSex?: "Men" | "Women";
  setBiologicalSex?: (s: "Men" | "Women") => void;
  activityMultiplier?: "Sedentary" | "Lightly Active" | "Moderately Active" | "Very Active";
  setActivityMultiplier?: (m: "Sedentary" | "Lightly Active" | "Moderately Active" | "Very Active") => void;
  proteinActivityFactor?: "Sedentary" | "Active" | "Strength";
  setProteinActivityFactor?: (f: "Sedentary" | "Active" | "Strength") => void;
};

export function FoodModule({
  weight: propWeight,
  setWeight: propSetWeight,
  height: propHeight,
  setHeight: propSetHeight,
  workoutEnabled = true,
  age: propAge,
  setAge: propSetAge,
  biologicalSex: propSex,
  setBiologicalSex: propSetSex,
  activityMultiplier: propActivity,
  setActivityMultiplier: propSetActivity,
  proteinActivityFactor: propProteinFactor,
  setProteinActivityFactor: propSetProteinFactor,
}: FoodModuleProps) {
  const [plateItems, setPlateItems] = useState<PlateItem[]>(initialPlateItems);
  const [water, setWater] = useState(0);
  const [notification, setNotification] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [dayCompleted, setDayCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSearchFoodId, setSelectedSearchFoodId] = useState<string | null>(null);
  const [searchGrams, setSearchGrams] = useState<number>(100);

  // Zustand state
  const {
    healthyStreak,
    incrementHealthyStreak,
    decayHealthyStreak,
    awardPoints,
  } = useNectStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      const todayStr = new Date().toISOString().split("T")[0];
      const lastDate = localStorage.getItem("nect_food_last_date");

      let loadedPlate = initialPlateItems;
      const storedPlate = localStorage.getItem("nect_food_plate_items");
      if (storedPlate) loadedPlate = JSON.parse(storedPlate);

      let loadedWater = 0;
      const storedWater = localStorage.getItem("nect_food_water");
      if (storedWater) loadedWater = Number(storedWater);

      let loadedCompleted = false;
      const storedCompleted = localStorage.getItem("nect_food_day_completed");
      if (storedCompleted) loadedCompleted = JSON.parse(storedCompleted);

      if (lastDate !== todayStr) {
        // Daily refresh: clear plate, water, and completion status
        loadedPlate = [];
        loadedWater = 0;
        loadedCompleted = false;
        localStorage.setItem("nect_food_last_date", todayStr);
        localStorage.setItem("nect_food_plate_items", JSON.stringify([]));
        localStorage.setItem("nect_food_water", "0");
        localStorage.setItem("nect_food_day_completed", "false");
      }

      setPlateItems(loadedPlate);
      setWater(loadedWater);
      setDayCompleted(loadedCompleted);
      setIsLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("nect_food_plate_items", JSON.stringify(plateItems));
  }, [plateItems, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("nect_food_water", String(water));
  }, [water, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("nect_food_day_completed", JSON.stringify(dayCompleted));
  }, [dayCompleted, isLoaded]);

  // Internal fallbacks for telemetry if workout module is disabled
  const [internalWeight, setInternalWeight] = useState(75);
  const [internalHeight, setInternalHeight] = useState(180);
  const [internalAge, setInternalAge] = useState(25);
  const [internalSex, setInternalSex] = useState<"Men" | "Women">("Men");
  const [internalActivity, setInternalActivity] = useState<"Sedentary" | "Lightly Active" | "Moderately Active" | "Very Active">("Moderately Active");
  const [internalProteinFactor, setInternalProteinFactor] = useState<"Sedentary" | "Active" | "Strength">("Strength");

  const weight = workoutEnabled && propWeight !== undefined ? propWeight : internalWeight;
  const height = workoutEnabled && propHeight !== undefined ? propHeight : internalHeight;
  const age = workoutEnabled && propAge !== undefined ? propAge : internalAge;
  const biologicalSex = workoutEnabled && propSex !== undefined ? propSex : internalSex;
  const activityMultiplier = workoutEnabled && propActivity !== undefined ? propActivity : internalActivity;
  const proteinActivityFactor = workoutEnabled && propProteinFactor !== undefined ? propProteinFactor : internalProteinFactor;

  // Calculators for targets
  const calculatedTargets = useMemo(() => {
    const bmr = biologicalSex === "Men"
      ? (10 * weight) + (6.25 * height) - (5 * age) + 5
      : (10 * weight) + (6.25 * height) - (5 * age) - 161;

    let multiplier = 1.55;
    if (activityMultiplier === "Sedentary") multiplier = 1.2;
    else if (activityMultiplier === "Lightly Active") multiplier = 1.375;
    else if (activityMultiplier === "Moderately Active") multiplier = 1.55;
    else if (activityMultiplier === "Very Active") multiplier = 1.725;

    const tdee = bmr * multiplier;

    let proteinMultiplier = 2.0;
    if (proteinActivityFactor === "Sedentary") proteinMultiplier = 1.0;
    else if (proteinActivityFactor === "Active") proteinMultiplier = 1.4;
    else if (proteinActivityFactor === "Strength") proteinMultiplier = 2.0;

    const protein = weight * proteinMultiplier;
    const fiber = (tdee / 1000) * 14;

    return {
      calories: Math.round(tdee),
      protein: Math.round(protein),
      fiber: Math.round(fiber * 10) / 10
    };
  }, [weight, height, age, biologicalSex, activityMultiplier, proteinActivityFactor]);

  const caloriesTarget = calculatedTargets.calories;
  const proteinTarget = calculatedTargets.protein;
  const fiberTarget = calculatedTargets.fiber;

  // Calculations for current consumed totals
  const totals = useMemo(() => {
    return plateItems.reduce(
      (acc, item) => {
        acc.calories += Math.round(item.calories * item.quantity);
        acc.protein += Math.round(item.protein * item.quantity * 10) / 10;
        acc.fiber += Math.round(item.fiber * item.quantity * 10) / 10;
        return acc;
      },
      { calories: 0, protein: 0, fiber: 0 },
    );
  }, [plateItems]);

  const isWaterGoalMet = water >= (biologicalSex === "Men" ? 3.0 : 2.2);
  const allTargetsMet = totals.calories >= caloriesTarget && totals.protein >= proteinTarget && totals.fiber >= fiberTarget;

  function handleTogglePlateItem(id: number) {
    let wasChecked = false;
    plateItems.forEach((item) => {
      if (item.id === id) wasChecked = item.checked;
    });

    setPlateItems((current) =>
      current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );

    // Award +10 XP for checking off meals eaten
    if (!wasChecked) {
      awardPoints(10, "Food");
    }
  }

  function handleDeletePlateItem(id: number) {
    setPlateItems((current) => current.filter((item) => item.id !== id));
  }

  function handleCompleteNutritionDay() {
    if (dayCompleted) return;
    setDayCompleted(true);
    incrementHealthyStreak();
    awardPoints(150, "Food");
    setNotification("Complete Nutrition Day recorded! Streak advanced & +150 XP awarded.");
  }



  async function handleSearchFood() {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSelectedSearchFoodId(null);
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          searchQuery,
        )}&search_simple=1&action=process&json=1&page_size=5`,
      );
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        const mapped = data.products.map((product: any) => ({
          id: product._id || String(Math.random()),
          name: product.product_name || "Unknown Product",
          brand: product.brands || "Generic",
          caloriesPer100g: Math.round(product.nutriments?.["energy-kcal_100g"] || 0),
          proteinPer100g: Number(product.nutriments?.proteins_100g) || 0,
          fiberPer100g: Number(product.nutriments?.fiber_100g) || 0,
        }));
        setSearchResults(mapped);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error(err);
      setNotification("Failed to connect to Open Food Facts API.");
    } finally {
      setSearchLoading(false);
    }
  }

  function handleLogSearchFood(food: SearchResult) {
    const grams = searchGrams || 100;
    const newItem: PlateItem = {
      id: Date.now(),
      name: `${food.name} (${food.brand})`,
      servingUnit: "Grams",
      quantity: grams,
      calories: food.caloriesPer100g / 100,
      protein: food.proteinPer100g / 100,
      fiber: food.fiberPer100g / 100,
      checked: true,
    };

    setPlateItems((current) => [...current, newItem]);
    setSelectedSearchFoodId(null);
    setSearchGrams(100);
    awardPoints(15, "Food");
  }

  return (
    <section className="space-y-6 animate-fade-in-up">
      {/* Top Panel (Main Panel) */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center md:items-start text-center md:text-left shrink-0">
              <h1 className="text-3xl font-black text-white uppercase tracking-wider">
                Meal Plan
              </h1>
              <span className="text-[10px] font-black tracking-[0.2em] text-[var(--rank-accent)] mt-1.5 uppercase">
                Restore your energy
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Telemetry / Status Row */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-slate-800/80">
          {/* Streak Indicator */}
          <div className="flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/50">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center">
              <Flame className="h-5 w-5 animate-pulse" style={{ color: "var(--rank-accent)" }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Food Streak</p>
              <p className="text-sm font-black text-white">{healthyStreak} Days</p>
            </div>
          </div>

          {/* Calories Indicator */}
          <div className="flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/50">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center">
              <Zap className="h-5 w-5" style={{ color: "var(--rank-accent)" }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Calories</p>
              <p className="text-sm font-black text-white">{totals.calories} kcal</p>
            </div>
          </div>

          {/* Protein Indicator */}
          <div className="flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/50">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center">
              <Beef className="h-5 w-5" style={{ color: "var(--rank-accent)" }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Protein</p>
              <p className="text-sm font-black text-white">{totals.protein.toFixed(2)}g</p>
            </div>
          </div>

          {/* Fiber Indicator */}
          <div className="flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/50">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center">
              <Leaf className="h-5 w-5" style={{ color: "var(--rank-accent)" }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fiber</p>
              <p className="text-sm font-black text-white">{totals.fiber.toFixed(2)}g</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main workspace container */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-sm sm:p-6">
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Effortless Food Intake Logger Form (LEFT SIDE) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-6 flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/50">
                    <PlusCircle className="h-5 w-5" style={{ color: "var(--rank-accent)" }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Log Today&apos;s Intake</h3>
                    <p className="text-xs text-slate-405">Select and log food item</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search food (e.g., Rice, Oats, Chicken)..."
                      className={`${fieldClass} flex-1`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearchFood();
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSearchFood}
                      disabled={searchLoading}
                      className="rounded-xl bg-[var(--rank-accent)]/20 border border-[var(--rank-accent)]/30 px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition-all duration-105 hover:bg-[var(--rank-accent)]/30 active:scale-95 cursor-pointer"
                    >
                      {searchLoading ? "Searching..." : "Search"}
                    </button>
                  </div>

                  {/* Search Results */}
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {searchResults.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-4">
                        {searchLoading ? "Fetching live nutriment data..." : "Enter query to search live database."}
                      </p>
                    ) : (
                      searchResults.map((food) => (
                        <div
                          key={food.id}
                          className="rounded-xl border border-slate-800 bg-slate-900/30 p-3 flex flex-col gap-2 transition-all hover:bg-slate-900/50"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="font-bold text-white text-xs">{food.name}</h4>
                              <p className="text-[10px] text-slate-550">{food.brand}</p>
                            </div>
                            <span className="text-[10px] font-mono text-[var(--rank-accent)] font-bold">100g base</span>
                          </div>

                          <div className="flex justify-between items-center gap-4 mt-1 border-t border-slate-900 pt-2">
                            <div className="text-[10px] text-slate-400 font-mono flex gap-2">
                              <span>{food.caloriesPer100g} kcal</span>
                              <span>•</span>
                              <span>{food.proteinPer100g.toFixed(2)}g Pro</span>
                              <span>•</span>
                              <span>{food.fiberPer100g.toFixed(2)}g Fib</span>
                            </div>

                            {selectedSearchFoodId === food.id ? (
                              <div className="flex items-center gap-1.5">
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={searchGrams}
                                    onChange={(e) => setSearchGrams(Math.max(1, Number(e.target.value) || 0))}
                                    className="w-16 rounded bg-slate-950 px-2 py-1 text-center text-xs font-bold text-white border border-slate-800 focus:border-emerald-500 outline-none"
                                    placeholder="g"
                                    min={1}
                                  />
                                  <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-bold uppercase pointer-events-none">g</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleLogSearchFood(food)}
                                  className="bg-emerald-600 border border-emerald-500 text-white hover:bg-emerald-500 active:scale-95 text-[10px] font-black uppercase px-2.5 py-1.5 rounded"
                                >
                                  Add
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedSearchFoodId(null)}
                                  className="bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 active:scale-95 text-[10px] font-black uppercase px-2 py-1.5 rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSearchFoodId(food.id);
                                  setSearchGrams(100);
                                }}
                                className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-450 hover:bg-emerald-500/20 active:scale-95 text-[10px] font-black uppercase px-2.5 py-1.5 rounded"
                              >
                                Add to Plate
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Minimalist Water Intake Engine (RIGHT SIDE) */}
            <div
              className={`relative rounded-2xl border p-6 transition-all duration-300 ${isWaterGoalMet
                  ? "border-emerald-500/80 bg-emerald-950/10 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20"
                  : "border-slate-800 bg-slate-950/35"
                }`}
            >
              {isWaterGoalMet && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                  Optimal Hydration Target Achieved
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${isWaterGoalMet ? "border-emerald-500/30 bg-emerald-950/70" : "border-slate-800 bg-slate-950/50"
                  }`}>
                  <Droplet className={`h-5 w-5 ${isWaterGoalMet ? "animate-pulse" : ""}`} style={{ color: "var(--rank-accent)" }} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Water Intake</h3>
                  <p className="text-xs text-slate-405">
                    Target: {biologicalSex === "Men" ? "3.0" : "2.2"} Liters ({biologicalSex === "Men" ? "12" : "9"} cups)
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                {/* Cups and Liters visualization */}
                <div className="flex flex-col items-center justify-center py-6 bg-slate-950/20 rounded-xl border border-slate-900/60">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-4xl font-black text-white">{Math.round(water / 0.25)}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">cups added</span>
                  </div>
                  <div className="text-xs font-mono text-slate-500">
                    Total: {water.toFixed(2)} Liters / {biologicalSex === "Men" ? "3.00" : "2.20"} Liters
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setWater((prev) => prev + 0.25)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition-all duration-105 hover:bg-blue-500 active:scale-95 cursor-pointer w-full shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add 1 Cup of water</span>
                  </button>
                  
                  {water > 0 && (
                    <button
                      type="button"
                      onClick={() => setWater((prev) => Math.max(0, prev - 0.25))}
                      className="text-slate-500 hover:text-slate-350 text-[10px] uppercase font-bold tracking-wider py-1 cursor-pointer transition-colors"
                    >
                      Remove 1 Cup
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Checklist Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-xl font-black text-white">Daily Meal</h2>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-bold items-center">
                <span className="rounded-full bg-slate-900/60 px-3 py-1.5 border border-slate-800 text-slate-200">
                  Cal:{" "}
                  <span
                    className={
                      totals.calories >= caloriesTarget ? "text-emerald-400 font-extrabold" : "text-cyan-405"
                    }
                  >
                    {totals.calories}
                  </span>{" "}
                  kcal
                </span>
                <span className="rounded-full bg-slate-900/60 px-3 py-1.5 border border-slate-800 text-slate-200">
                  Pro:{" "}
                  <span
                    className={
                      totals.protein >= proteinTarget ? "text-emerald-400 font-extrabold" : "text-cyan-405"
                    }
                  >
                    {totals.protein.toFixed(2)}g
                  </span>
                </span>
                <span className="rounded-full bg-slate-900/60 px-3 py-1.5 border border-slate-800 text-slate-200">
                  Fib:{" "}
                  <span
                    className={totals.fiber >= fiberTarget ? "text-emerald-400 font-extrabold" : "text-cyan-405"}
                  >
                    {totals.fiber.toFixed(2)}g
                  </span>
                </span>



                {allTargetsMet && (
                  <button
                    type="button"
                    disabled={dayCompleted}
                    className={`rounded-lg px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.35)] cursor-pointer ${
                      dayCompleted
                        ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed shadow-none"
                        : "bg-emerald-600 hover:bg-emerald-500 active:scale-95"
                    }`}
                    onClick={handleCompleteNutritionDay}
                  >
                    {dayCompleted ? "✓ Day Recorded" : "Complete Nutrition Day"}
                  </button>
                )}
              </div>
            </div>

            {plateItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/30 p-8 text-center text-slate-500 text-sm">
                No food logged to today&apos;s plate. Search and log an item on the left.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-505">
                      <th className="py-3 px-4">Food Item</th>
                      <th className="py-3 px-4">Quantity / Serving</th>
                      <th className="py-3 px-4">Calories</th>
                      <th className="py-3 px-4">Protein</th>
                      <th className="py-3 px-4">Fiber</th>
                      <th className="py-3 px-4 text-right w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {plateItems.map((item) => {
                      const itemCalories = Math.round(item.calories * item.quantity);
                      const itemProtein = Math.round(item.protein * item.quantity * 10) / 10;
                      const itemFiber = Math.round(item.fiber * item.quantity * 10) / 10;

                      return (
                        <tr
                          key={item.id}
                          className="transition-all duration-300 hover:bg-slate-950/15"
                        >
                          <td className="py-3 px-4 font-bold text-slate-200">
                            <span>
                              {item.name}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-mono text-sm">
                            <span>
                              {item.quantity} {item.servingUnit}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-mono text-sm">
                            <span>
                              {itemCalories} kcal
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-mono text-sm">
                            <span>
                              {itemProtein.toFixed(2)}g
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-mono text-sm">
                            <span>
                              {itemFiber.toFixed(2)}g
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2 text-rose-300 transition-all duration-100 hover:bg-rose-500/25 active:scale-95 cursor-pointer"
                              onClick={() => handleDeletePlateItem(item.id)}
                              aria-label={`Delete ${item.name}`}
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
        </div>
      </div>
    </section>
  );
}
