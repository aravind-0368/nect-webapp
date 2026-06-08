"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState, useEffect } from "react";
import { Droplet, Plus, Minus, Trash2, PlusCircle, Apple } from "lucide-react";

type ServingUnitType = "Grams" | "Bowls" | "Whole Fruit" | "Milliliters" | "Scoops";

type CustomFoodItem = {
  id: number;
  name: string;
  servingUnit: ServingUnitType;
  calories: number;
  protein: number;
  fiber: number;
};

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

const initialCustomFoods: CustomFoodItem[] = [
  {
    id: 1,
    name: "Rolled Oats",
    servingUnit: "Bowls",
    calories: 150,
    protein: 5,
    fiber: 4,
  },
  {
    id: 2,
    name: "Banana",
    servingUnit: "Whole Fruit",
    calories: 105,
    protein: 1.3,
    fiber: 3,
  },
  {
    id: 3,
    name: "Chicken Breast",
    servingUnit: "Grams",
    calories: 1.65, // per 1 gram
    protein: 0.31,
    fiber: 0,
  },
  {
    id: 4,
    name: "Rice",
    servingUnit: "Bowls",
    calories: 205,
    protein: 4.2,
    fiber: 0.6,
  },
];

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
};

export function FoodModule({
  weight: propWeight,
  setWeight: propSetWeight,
  height: propHeight,
  setHeight: propSetHeight,
  workoutEnabled = true,
}: FoodModuleProps) {
  const [activeView, setActiveView] = useState<"plate" | "custom">("plate");
  const [customFoods, setCustomFoods] = useState<CustomFoodItem[]>(initialCustomFoods);
  const [plateItems, setPlateItems] = useState<PlateItem[]>(initialPlateItems);
  const [water, setWater] = useState(0);
  const [notification, setNotification] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedPlate = localStorage.getItem("nect_food_plate_items");
      const storedCustom = localStorage.getItem("nect_food_custom_foods");
      const storedWater = localStorage.getItem("nect_food_water");
      if (storedPlate) setPlateItems(JSON.parse(storedPlate));
      if (storedCustom) setCustomFoods(JSON.parse(storedCustom));
      if (storedWater) setWater(Number(storedWater));
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
    localStorage.setItem("nect_food_custom_foods", JSON.stringify(customFoods));
  }, [customFoods, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("nect_food_water", String(water));
  }, [water, isLoaded]);

  // Form states for log today's intake
  const [selectedFoodId, setSelectedFoodId] = useState<number>(1);
  const [logQuantity, setLogQuantity] = useState<number>(1);

  // Form states for custom food builder
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState<ServingUnitType>("Grams");
  const [newCalories, setNewCalories] = useState<number | "">("");
  const [newProtein, setNewProtein] = useState<number | "">("");
  const [newFiber, setNewFiber] = useState<number | "">("");

  // Internal fallbacks for telemetry if workout module is disabled
  const [internalWeight, setInternalWeight] = useState(75);
  const [internalHeight, setInternalHeight] = useState(180);

  // Determine weight/height to use based on module enablement
  const weight = workoutEnabled && propWeight !== undefined ? propWeight : internalWeight;
  const setWeight = workoutEnabled && propSetWeight !== undefined ? propSetWeight : setInternalWeight;
  const height = workoutEnabled && propHeight !== undefined ? propHeight : internalHeight;
  const setHeight = workoutEnabled && propSetHeight !== undefined ? propSetHeight : setInternalHeight;

  // Calculators for targets
  const caloriesTarget = useMemo(() => Math.round(weight * 30), [weight]);
  const proteinTarget = useMemo(() => Math.round(weight * 2.0), [weight]);
  const fiberTarget = useMemo(() => Math.round(height / 7), [height]);

  // Selected food item in the dropdown
  const selectedFoodItem = useMemo(() => {
    return customFoods.find((f) => f.id === selectedFoodId) || customFoods[0];
  }, [customFoods, selectedFoodId]);

  // Keep dropdown selection valid when customFoods changes
  useEffect(() => {
    if (customFoods.length > 0 && !customFoods.some((f) => f.id === selectedFoodId)) {
      const timer = setTimeout(() => {
        setSelectedFoodId(customFoods[0].id);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [customFoods, selectedFoodId]);

  // Calculations for current consumed totals from checklist checked items
  const totals = useMemo(() => {
    return plateItems.reduce(
      (acc, item) => {
        if (item.checked) {
          acc.calories += Math.round(item.calories * item.quantity);
          acc.protein += Math.round(item.protein * item.quantity * 10) / 10;
          acc.fiber += Math.round(item.fiber * item.quantity * 10) / 10;
        }
        return acc;
      },
      { calories: 0, protein: 0, fiber: 0 },
    );
  }, [plateItems]);

  const bmi = height > 0 ? weight / (height / 100) ** 2 : 0;
  const bmiMeta = getBmiMeta(bmi);

  const isWaterGoalMet = water >= 3.0;

  // Handlers
  function handleAddCustomFood(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newName.trim()) return;

    const newItem: CustomFoodItem = {
      id: Date.now(),
      name: newName,
      servingUnit: newUnit,
      calories: Number(newCalories) || 0,
      protein: Number(newProtein) || 0,
      fiber: Number(newFiber) || 0,
    };

    setCustomFoods((current) => [...current, newItem]);
    setNewName("");
    setNewUnit("Grams");
    setNewCalories("");
    setNewProtein("");
    setNewFiber("");
    setNotification(`${newName} saved to Kitchen Dictionary.`);
  }

  function handleDeleteCustomFood(id: number) {
    const foodToDelete = customFoods.find((f) => f.id === id);
    setCustomFoods((current) => current.filter((f) => f.id !== id));
    if (foodToDelete) {
      setNotification(`${foodToDelete.name} removed from Kitchen Dictionary.`);
    }
  }

  function handleLogPlateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFoodItem) return;

    const newItem: PlateItem = {
      id: Date.now(),
      name: selectedFoodItem.name,
      servingUnit: selectedFoodItem.servingUnit,
      quantity: logQuantity,
      calories: selectedFoodItem.calories,
      protein: selectedFoodItem.protein,
      fiber: selectedFoodItem.fiber,
      checked: true, // starts checked by default for immediate logging feedback, user can toggle
    };

    setPlateItems((current) => [...current, newItem]);
    setLogQuantity(1);
    setNotification(`${logQuantity} ${selectedFoodItem.servingUnit} of ${selectedFoodItem.name} logged.`);
  }

  function handleTogglePlateItem(id: number) {
    setPlateItems((current) =>
      current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  }

  function handleDeletePlateItem(id: number) {
    setPlateItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section className="space-y-6 animate-fade-in-up">
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Dynamic target tag & header */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--rank-accent)]/30 bg-slate-950/70 shadow-[0_0_28px_rgba(34,211,238,0.1)]">
              <Image
                src="/assets/icons/food.png"
                alt="Food module icon"
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Food Module
              </p>
              <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">
                NUTRITION
              </h1>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-[var(--rank-accent)]/25 bg-[var(--rank-accent)]/10 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.1)]">
              <span className="text-[var(--rank-accent)] font-bold">TARGETS:</span>{" "}
              {caloriesTarget} kcal <span className="text-slate-600">|</span> {proteinTarget}g Protein <span className="text-slate-600">|</span> {fiberTarget}g Fiber
            </div>
            {notification && (
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                {notification}
              </span>
            )}
          </div>

          <div className="mt-6 inline-flex rounded-2xl border border-slate-800 bg-slate-950/55 p-1">
            {[
              { id: "plate" as const, label: "Today's Plate" },
              { id: "custom" as const, label: "Custom Food" },
            ].map((view) => (
              <button
                key={view.id}
                type="button"
                className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.1em] transition-all duration-100 active:scale-95 ${activeView === view.id
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

        {/* Health telemetry card */}
        <HealthTelemetry
          bmi={bmi}
          bmiMeta={bmiMeta}
          height={height}
          setHeight={setHeight}
          setWeight={setWeight}
          weight={weight}
          workoutEnabled={workoutEnabled}
        />
      </div>

      {/* Main workspace container */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-sm sm:p-6">
        {activeView === "plate" ? (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              {/* Minimalist Water Intake Engine */}
              <div
                className={`rounded-2xl border p-6 transition-all duration-300 ${isWaterGoalMet
                    ? "border-emerald-500/80 bg-emerald-950/10 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20"
                    : "border-slate-800 bg-slate-950/35"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${isWaterGoalMet ? "border-emerald-500/30 bg-emerald-950/70" : "border-slate-800 bg-slate-950/50"
                    }`}>
                    <Droplet className={`h-5 w-5 ${isWaterGoalMet ? "text-emerald-400 animate-pulse" : "text-blue-400"}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Water Hydration Engine</h3>
                    <p className="text-xs text-slate-400">Target: 3.0 Liters</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-6">
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-850 text-slate-200 transition-all duration-100 hover:bg-slate-750 active:scale-95 cursor-pointer"
                    onClick={() => setWater((prev) => Math.max(0, prev - 0.25))}
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <div className="text-center min-w-[120px]">
                    <span className="text-3xl font-black text-white">{water.toFixed(2)}</span>
                    <span className="ml-1 text-sm font-bold text-slate-400">L</span>
                  </div>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-850 text-slate-200 transition-all duration-100 hover:bg-slate-750 active:scale-95 cursor-pointer"
                    onClick={() => setWater((prev) => prev + 0.25)}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                {isWaterGoalMet && (
                  <p className="mt-4 text-center text-xs font-bold text-emerald-400 animate-bounce">
                    ✨ Optimal Hydration Target Achieved!
                  </p>
                )}
              </div>

              {/* Effortless Food Intake Logger Form */}
              <form
                onSubmit={handleLogPlateItem}
                className="rounded-2xl border border-slate-800 bg-slate-950/35 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/50">
                      <PlusCircle className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Log Today&apos;s Intake</h3>
                      <p className="text-xs text-slate-400">Select and log custom foods</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-[1.5fr_1fr]">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Food Item
                      </span>
                      <select
                        className={`${fieldClass} w-full`}
                        value={selectedFoodId}
                        onChange={(e) => setSelectedFoodId(Number(e.target.value))}
                      >
                        {customFoods.length === 0 ? (
                          <option value="">No Custom Foods</option>
                        ) : (
                          customFoods.map((food) => (
                            <option key={food.id} value={food.id}>
                              {food.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Quantity ({selectedFoodItem?.servingUnit || "Units"})
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        className={`${fieldClass} w-full`}
                        value={logQuantity}
                        onChange={(e) => setLogQuantity(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition-all duration-100 hover:bg-emerald-500 active:scale-95 cursor-pointer"
                    disabled={customFoods.length === 0}
                  >
                    Log to Today&apos;s Plate
                  </button>
                </div>
              </form>
            </div>

            {/* Checklist Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white">Daily Meal Checklist</h2>
                  <p className="text-xs text-slate-400">
                    Check items to add them to your day&apos;s macro accumulation
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-slate-900/60 px-3 py-1.5 border border-slate-800 text-slate-200">
                    Cal:{" "}
                    <span
                      className={
                        totals.calories >= caloriesTarget ? "text-emerald-400" : "text-cyan-400"
                      }
                    >
                      {totals.calories}
                    </span>{" "}
                    / {caloriesTarget} kcal
                  </span>
                  <span className="rounded-full bg-slate-900/60 px-3 py-1.5 border border-slate-800 text-slate-200">
                    Pro:{" "}
                    <span
                      className={
                        totals.protein >= proteinTarget ? "text-emerald-400" : "text-cyan-400"
                      }
                    >
                      {totals.protein}g
                    </span>{" "}
                    / {proteinTarget}g
                  </span>
                  <span className="rounded-full bg-slate-900/60 px-3 py-1.5 border border-slate-800 text-slate-200">
                    Fib:{" "}
                    <span
                      className={totals.fiber >= fiberTarget ? "text-emerald-400" : "text-cyan-400"}
                    >
                      {totals.fiber.toFixed(1)}g
                    </span>{" "}
                    / {fiberTarget}g
                  </span>
                </div>
              </div>

              {plateItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/30 p-8 text-center text-slate-500 text-sm">
                  No food logged to today&apos;s plate. Log an item above or create new foods in Custom
                  Food.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4 w-12 text-center">Status</th>
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
                            className={`transition-all duration-300 ${item.checked ? "opacity-40 bg-slate-950/5" : "hover:bg-slate-950/15"
                              }`}
                          >
                            <td className="py-3 px-4 text-center">
                              <label className="inline-flex cursor-pointer items-center justify-center w-5 h-5 rounded border border-slate-700 bg-slate-900 transition-transform active:scale-95">
                                <input
                                  type="checkbox"
                                  checked={item.checked}
                                  onChange={() => handleTogglePlateItem(item.id)}
                                  className="h-3.5 w-3.5 accent-[var(--rank-accent)]"
                                />
                              </label>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-200">
                              <span className={item.checked ? "line-through text-slate-500" : ""}>
                                {item.name}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono text-sm">
                              <span className={item.checked ? "line-through text-slate-500" : ""}>
                                {item.quantity} {item.servingUnit}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-300 font-mono text-sm">
                              <span className={item.checked ? "line-through text-slate-500" : ""}>
                                {itemCalories} kcal
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-300 font-mono text-sm">
                              <span className={item.checked ? "line-through text-slate-500" : ""}>
                                {itemProtein}g
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-300 font-mono text-sm">
                              <span className={item.checked ? "line-through text-slate-500" : ""}>
                                {itemFiber}g
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
        ) : (
          <div className="space-y-6">
            {/* Custom Intake Builder Form */}
            <form
              className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5"
              onSubmit={handleAddCustomFood}
            >
              <div className="mb-4">
                <h2 className="text-xl font-black text-white">Create Custom Food Entry</h2>
                <p className="text-sm text-slate-400">
                  Configure food details to expand your selectable kitchen dictionary.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.8fr]">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Food Name
                  </span>
                  <input
                    className={fieldClass}
                    placeholder="e.g. Rolled Oats"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Serving Unit
                  </span>
                  <select
                    className={fieldClass}
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value as ServingUnitType)}
                  >
                    {["Grams", "Bowls", "Whole Fruit", "Milliliters", "Scoops"].map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Calories (kcal)
                  </span>
                  <input
                    className={fieldClass}
                    min={0}
                    type="number"
                    required
                    placeholder="e.g. 150"
                    value={newCalories}
                    onChange={(e) =>
                      setNewCalories(e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Protein (g)
                  </span>
                  <input
                    className={fieldClass}
                    min={0}
                    step="any"
                    type="number"
                    required
                    placeholder="e.g. 5"
                    value={newProtein}
                    onChange={(e) =>
                      setNewProtein(e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Fiber (g)
                  </span>
                  <input
                    className={fieldClass}
                    min={0}
                    step="any"
                    type="number"
                    required
                    placeholder="e.g. 4"
                    value={newFiber}
                    onChange={(e) =>
                      setNewFiber(e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition-all duration-100 hover:bg-emerald-500 active:scale-95 cursor-pointer"
                >
                  Save to Kitchen Dict
                </button>
              </div>
            </form>

            {/* Saved Kitchen Dictionary */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5">
              <h2 className="text-xl font-black text-white mb-4">🍏 Saved Kitchen Dictionary</h2>
              {customFoods.length === 0 ? (
                <p className="text-sm text-slate-500">No custom foods configured.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {customFoods.map((food) => (
                    <div
                      key={food.id}
                      className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
                    >
                      <div>
                        <h3 className="font-bold text-white truncate pr-6">{food.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">1 {food.servingUnit}</p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono text-slate-400">
                        <span>{food.calories} kcal</span>
                        <span>•</span>
                        <span>{food.protein}g Pro</span>
                        <span>•</span>
                        <span>{food.fiber}g Fib</span>
                      </div>

                      <button
                        type="button"
                        className="absolute top-4 right-4 rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400 transition-transform duration-100 hover:text-rose-400 active:scale-95 cursor-pointer"
                        onClick={() => handleDeleteCustomFood(food.id)}
                        aria-label={`Delete ${food.name}`}
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
  workoutEnabled,
}: {
  bmi: number;
  bmiMeta: { label: string; className: string };
  height: number;
  setHeight: (value: number) => void;
  setWeight: (value: number) => void;
  weight: number;
  workoutEnabled: boolean;
}) {
  return (
    <aside className="rounded-2xl border border-slate-800/80 bg-slate-900/45 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
          Health Telemetry
        </p>
        {workoutEnabled ? (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-450 border border-emerald-500/20">
            Handshake Live
          </span>
        ) : (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-black text-amber-400 border border-amber-500/20">
            Offline (Static Defaults)
          </span>
        )}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Weight kg
          </span>
          <input
            className={`${fieldClass} w-full disabled:opacity-50`}
            min={1}
            type="number"
            value={weight}
            onChange={(event) => setWeight(Number(event.target.value))}
            disabled={!workoutEnabled}
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Height cm
          </span>
          <input
            className={`${fieldClass} w-full disabled:opacity-50`}
            min={1}
            type="number"
            value={height}
            onChange={(event) => setHeight(Number(event.target.value))}
            disabled={!workoutEnabled}
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
      {!workoutEnabled && (
        <p className="mt-4 text-xs text-amber-300/80 leading-relaxed">
          ⚠️ Enable the Workout module in Settings to reactivate live telemetry synchronization.
        </p>
      )}
    </aside>
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
