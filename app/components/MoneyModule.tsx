"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import Image from "next/image";
import { useNectStore, getCurrencySymbol } from "../store/useNectStore";
import {
  Wallet,
  Plus,
  Trash2,
  PlusCircle,
  AlertTriangle,
  Check,
  X,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  History,
  FileText,
  ArrowUp,
  ArrowDown,
  Sliders,
  CreditCard,
  Edit2,
  Eye
} from "lucide-react";

type TransactionType = "income" | "expense";

interface Transaction {
  id: string;
  name: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
}

interface Category {
  name: string;
  color: string; // Hex code, e.g. #ef4444
  monthlyLimit: number | null;
}

interface RecurringRule {
  id: string;
  name: string;
  type: TransactionType;
  category: string;
  amount: number;
  dayOfMonth: number;
}



const defaultCategories: Category[] = [
  { name: "Salary", color: "#10b981", monthlyLimit: null }, // Emerald
  { name: "Freelance", color: "#3b82f6", monthlyLimit: null }, // Blue
  { name: "Food", color: "#f59e0b", monthlyLimit: 500 }, // Amber
  { name: "Rent & Utilities", color: "#ef4444", monthlyLimit: 1200 }, // Red
  { name: "Subscriptions", color: "#a855f7", monthlyLimit: 80 }, // Purple
  { name: "Other", color: "#64748b", monthlyLimit: null }, // Slate
];

const defaultTransactions: Transaction[] = [
  {
    id: "tx-1",
    name: "Monthly Salary Deposit",
    type: "income",
    category: "Salary",
    amount: 3200,
    date: "2026-06-01",
  },
  {
    id: "tx-2",
    name: "Apartment Rental Payment",
    type: "expense",
    category: "Rent & Utilities",
    amount: 1000,
    date: "2026-06-01",
  },
  {
    id: "tx-3",
    name: "Organic Groceries",
    type: "expense",
    category: "Food",
    amount: 280,
    date: "2026-06-04",
  },
  {
    id: "tx-4",
    name: "Freelance UI Design",
    type: "income",
    category: "Freelance",
    amount: 850,
    date: "2026-06-05",
  },
  {
    id: "tx-5",
    name: "Fast Food Takeout",
    type: "expense",
    category: "Food",
    amount: 130,
    date: "2026-06-07",
  },
];

const defaultRecurringRules: RecurringRule[] = [
  {
    id: "rec-1",
    name: "Netflix Subscription",
    type: "expense",
    category: "Subscriptions",
    amount: 15,
    dayOfMonth: 8,
  },
  {
    id: "rec-2",
    name: "Gym Membership",
    type: "expense",
    category: "Other",
    amount: 45,
    dayOfMonth: 8,
  },
  {
    id: "rec-3",
    name: "AWS Cloud Overheads",
    type: "expense",
    category: "Freelance",
    amount: 120,
    dayOfMonth: 12,
  },
];

const colorPalette = [
  { name: "Red", hex: "#ef4444" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Slate", hex: "#64748b" },
];

export function MoneyModule() {
  const { autoApproveTransactions, currency, setCurrency } = useNectStore();
  // --- STATE ---
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>(defaultRecurringRules);
  const [processedRecurring, setProcessedRecurring] = useState<string[]>([]);

  // Onboarding Form State
  const [onboardingInput, setOnboardingInput] = useState<string>("");

  // Transaction Form State
  const [txType, setTxType] = useState<TransactionType>("expense");
  const [txName, setTxName] = useState<string>("");
  const [txAmount, setTxAmount] = useState<string>("");
  const [txCategory, setTxCategory] = useState<string>("");

  // Category Popover State
  const [showCategoryCreator, setShowCategoryCreator] = useState<boolean>(false);
  const [showLimitManager, setShowLimitManager] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>("");
  const [newCatColor, setNewCatColor] = useState<string>("#ef4444");
  const [newCatLimit, setNewCatLimit] = useState<string>("");
  const [editingCategoryOriginalName, setEditingCategoryOriginalName] = useState<string | null>(null);

  // Recurring UI States
  const [showRecurringManager, setShowRecurringManager] = useState<boolean>(false);
  const [newRecName, setNewRecName] = useState<string>("");
  const [newRecType, setNewRecType] = useState<TransactionType>("expense");
  const [newRecCategory, setNewRecCategory] = useState<string>("");
  const [newRecAmount, setNewRecAmount] = useState<string>("");
  const [newRecDay, setNewRecDay] = useState<string>("1");

  // Notifications
  const [notification, setNotification] = useState<string>("");
  const [selectedTxForBill, setSelectedTxForBill] = useState<Transaction | null>(null);

  // --- HELPER FUNCTIONS ---
  const showTempNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? "" : curr));
    }, 4000);
  };

  const saveState = (
    updatedInitialized: boolean,
    updatedInitialBalance: number,
    updatedTx: Transaction[],
    updatedCat: Category[],
    updatedRec: RecurringRule[],
    updatedProcessed: string[]
  ) => {
    localStorage.setItem("nect_money_initialized", String(updatedInitialized));
    localStorage.setItem("nect_money_initial_balance", String(updatedInitialBalance));
    localStorage.setItem("nect_money_transactions", JSON.stringify(updatedTx));
    localStorage.setItem("nect_money_categories", JSON.stringify(updatedCat));
    localStorage.setItem("nect_money_recurring_rules", JSON.stringify(updatedRec));
    localStorage.setItem("nect_money_processed_recurring", JSON.stringify(updatedProcessed));
  };

  // --- LOCAL STORAGE SYNC ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const storedInitialized = localStorage.getItem("nect_money_initialized");
      if (storedInitialized === "true") {
        setIsInitialized(true);

        const balanceVal = Number(localStorage.getItem("nect_money_initial_balance") || "0");
        setInitialBalance(balanceVal);

        let loadedTx: Transaction[] = [];
        const storedTx = localStorage.getItem("nect_money_transactions");
        if (storedTx) loadedTx = JSON.parse(storedTx);
        else loadedTx = defaultTransactions;

        let loadedCat = defaultCategories;
        const storedCat = localStorage.getItem("nect_money_categories");
        if (storedCat) loadedCat = JSON.parse(storedCat);
        setCategories(loadedCat);

        let loadedRec = defaultRecurringRules;
        const storedRec = localStorage.getItem("nect_money_recurring_rules");
        if (storedRec) loadedRec = JSON.parse(storedRec);
        setRecurringRules(loadedRec);

        let loadedProcessed: string[] = [];
        const storedProcessed = localStorage.getItem("nect_money_processed_recurring");
        if (storedProcessed) loadedProcessed = JSON.parse(storedProcessed);

        const storedCurrency = localStorage.getItem("nect_money_currency");
        if (storedCurrency) {
          setCurrency(storedCurrency);
          localStorage.removeItem("nect_money_currency");
        }

        // Auto-approve check on mount
        if (autoApproveTransactions) {
          const today = new Date();
          const currentDay = today.getDate();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, "0");
          const monthKey = `${year}-${month}`;

          const pending = loadedRec.filter((rule) => {
            const isDue = currentDay >= rule.dayOfMonth;
            const processKey = `${rule.id}-${monthKey}`;
            const isProcessed = loadedProcessed.includes(processKey);
            return isDue && !isProcessed;
          });

          if (pending.length > 0) {
            const newTxList = [...loadedTx];
            const newProcessed = [...loadedProcessed];

            pending.forEach((rule) => {
              const processKey = `${rule.id}-${monthKey}`;
              const dateString = `${monthKey}-${String(rule.dayOfMonth).padStart(2, "0")}`;
              const newTx: Transaction = {
                id: `tx-auto-${rule.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                name: `[Auto] ${rule.name}`,
                type: rule.type,
                category: rule.category,
                amount: rule.amount,
                date: dateString,
              };
              newTxList.unshift(newTx);
              newProcessed.push(processKey);
            });

            loadedTx = newTxList;
            loadedProcessed = newProcessed;

            localStorage.setItem("nect_money_transactions", JSON.stringify(newTxList));
            localStorage.setItem("nect_money_processed_recurring", JSON.stringify(newProcessed));

            setNotification(`Auto-processed ${pending.length} recurring transaction(s).`);
          }
        }

        setTransactions(loadedTx);
        setProcessedRecurring(loadedProcessed);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [autoApproveTransactions]);

  // --- DYNAMIC CALCULATIONS ---
  const currencySymbol = getCurrencySymbol(currency);

  const totalEarnings = useMemo(() => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const netLiquidity = useMemo(() => {
    return initialBalance + totalEarnings - totalExpenses;
  }, [initialBalance, totalEarnings, totalExpenses]);

  const todaysPayment = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return transactions
      .filter((t) => t.date === todayStr && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalProfitLoss = useMemo(() => {
    return totalEarnings - totalExpenses;
  }, [totalEarnings, totalExpenses]);

  // Current year-month key for logging recurring transactions, e.g. "2026-06"
  const currentMonthKey = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }, []);

  const monthlyNetYield = useMemo(() => {
    const currentMonthTx = transactions.filter((t) => t.date.startsWith(currentMonthKey));
    const earnings = currentMonthTx
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = currentMonthTx
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return earnings - expenses;
  }, [transactions, currentMonthKey]);

  // Calculate accumulated spending by category for warning alerts
  const categoryExpenses = useMemo(() => {
    const currentMonthExpenses = transactions.filter(
      (t) => t.type === "expense" && t.date.startsWith(currentMonthKey)
    );
    const totals: Record<string, number> = {};
    currentMonthExpenses.forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    return totals;
  }, [transactions, currentMonthKey]);

  // Check if a category has exceeded 80% or more of its spending cap
  const checkCategoryThreshold = (categoryName: string) => {
    const cat = categories.find((c) => c.name === categoryName);
    if (!cat || cat.monthlyLimit === null) return { exceeded: false, percent: 0 };
    const spent = categoryExpenses[categoryName] || 0;
    const limit = cat.monthlyLimit;
    const percent = limit > 0 ? (spent / limit) * 100 : 0;
    return { exceeded: percent >= 80, percent };
  };

  // --- RECURRING GATEKEEPER INTERCEPTOR LOGIC ---
  const currentDayOfMonth = useMemo(() => {
    return new Date().getDate();
  }, []);

  // Find recurring rules that are currently due (dayOfMonth <= currentDayOfMonth)
  // and have NOT been processed (approved or skipped) in the current month
  const pendingRecurringTransactions = useMemo(() => {
    return recurringRules.filter((rule) => {
      const isDue = currentDayOfMonth >= rule.dayOfMonth;
      const processKey = `${rule.id}-${currentMonthKey}`;
      const isProcessed = processedRecurring.includes(processKey);
      return isDue && !isProcessed;
    });
  }, [recurringRules, currentDayOfMonth, processedRecurring, currentMonthKey]);

  // Fallback defaults for form selectors
  const activeTxCategory = txCategory || (categories[0]?.name || "");
  const activeRecCategory = newRecCategory || (categories[0]?.name || "");

  const handleInitialize = (e: FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(onboardingInput);
    if (isNaN(balance) || balance < 0) {
      alert("Please enter a valid initial balance.");
      return;
    }

    setIsInitialized(true);
    setInitialBalance(balance);
    setTransactions(defaultTransactions);

    saveState(true, balance, defaultTransactions, categories, recurringRules, processedRecurring);
    showTempNotification("Finance ledger successfully initialized!");
  };

  const handleAddTransaction = (e: FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(txAmount);
    if (!txName.trim()) {
      alert("Please enter a transaction name.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      name: txName.trim(),
      type: txType,
      category: activeTxCategory,
      amount: amount,
      date: dateStr,
    };

    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    setTxName("");
    setTxAmount("");

    saveState(isInitialized, initialBalance, updatedTxs, categories, recurringRules, processedRecurring);
    showTempNotification(`Logged: ${txType === "income" ? "+" : "-"}${currencySymbol}${amount} for ${newTx.name}`);
  };

  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    const updatedTxs = transactions.filter((t) => t.id !== id);
    setTransactions(updatedTxs);

    saveState(isInitialized, initialBalance, updatedTxs, categories, recurringRules, processedRecurring);
    if (target) {
      showTempNotification(`Deleted: ${target.name}`);
    }
  };

  const handleSaveCategory = (e: FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;

    const limit = newCatLimit.trim() ? parseFloat(newCatLimit) : null;

    if (editingCategoryOriginalName) {
      // Editing Mode
      const isDuplicate = categories.some(
        (c) =>
          c.name.toLowerCase() === name.toLowerCase() &&
          c.name.toLowerCase() !== editingCategoryOriginalName.toLowerCase()
      );
      if (isDuplicate) {
        alert("A category with this name already exists.");
        return;
      }

      // Update categories array
      const updatedCats = categories.map((c) =>
        c.name === editingCategoryOriginalName
          ? { ...c, name, color: newCatColor, monthlyLimit: limit && !isNaN(limit) ? limit : null }
          : c
      );

      // Cascade update transactions
      const updatedTxs = transactions.map((t) =>
        t.category === editingCategoryOriginalName ? { ...t, category: name } : t
      );

      // Cascade update recurring rules
      const updatedRecs = recurringRules.map((r) =>
        r.category === editingCategoryOriginalName ? { ...r, category: name } : r
      );

      setCategories(updatedCats);
      setTransactions(updatedTxs);
      setRecurringRules(updatedRecs);

      setNewCatName("");
      setNewCatLimit("");
      setEditingCategoryOriginalName(null);

      // Update selectors if they matched
      if (txCategory === editingCategoryOriginalName) setTxCategory(name);
      if (newRecCategory === editingCategoryOriginalName) setNewRecCategory(name);

      saveState(isInitialized, initialBalance, updatedTxs, updatedCats, updatedRecs, processedRecurring);
      showTempNotification(`Category "${name}" updated.`);
    } else {
      // Creating Mode
      if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        alert("A category with this name already exists.");
        return;
      }

      const newCategory: Category = {
        name,
        color: newCatColor,
        monthlyLimit: limit && !isNaN(limit) ? limit : null,
      };

      const updatedCats = [...categories, newCategory];
      setCategories(updatedCats);
      setNewCatName("");
      setNewCatLimit("");

      setTxCategory(name);
      setNewRecCategory(name);

      saveState(isInitialized, initialBalance, transactions, updatedCats, recurringRules, processedRecurring);
      showTempNotification(`Category "${name}" created.`);
    }
  };

  const handleDeleteCategory = (catName: string) => {
    if (categories.length <= 1) {
      alert("You must have at least one category tag.");
      return;
    }
    if (confirm(`Are you sure you want to delete category "${catName}"? Matching transactions will be reassigned to your first category.`)) {
      const fallbackCat = categories.find((c) => c.name !== catName && c.name.toLowerCase() === "other")
        || categories.find((c) => c.name !== catName);

      const fallbackName = fallbackCat ? fallbackCat.name : "Other";

      const updatedCats = categories.filter((c) => c.name !== catName);

      // Cascade update transactions
      const updatedTxs = transactions.map((t) =>
        t.category === catName ? { ...t, category: fallbackName } : t
      );

      // Cascade update recurring rules
      const updatedRecs = recurringRules.map((r) =>
        r.category === catName ? { ...r, category: fallbackName } : r
      );

      setCategories(updatedCats);
      setTransactions(updatedTxs);
      setRecurringRules(updatedRecs);

      // Update active dropdown selections if they matched the deleted category
      if (txCategory === catName) setTxCategory(fallbackName);
      if (newRecCategory === catName) setNewRecCategory(fallbackName);

      if (editingCategoryOriginalName === catName) {
        setEditingCategoryOriginalName(null);
        setNewCatName("");
        setNewCatLimit("");
      }

      saveState(isInitialized, initialBalance, updatedTxs, updatedCats, updatedRecs, processedRecurring);
      showTempNotification(`Category "${catName}" deleted.`);
    }
  };

  // Interceptor Actions
  const handleApproveRecurring = (rule: RecurringRule) => {
    const processKey = `${rule.id}-${currentMonthKey}`;
    const dateStr = `${currentMonthKey}-${String(rule.dayOfMonth).padStart(2, "0")}`;

    const newTx: Transaction = {
      id: `tx-rec-${rule.id}-${Date.now()}`,
      name: rule.name,
      type: rule.type,
      category: rule.category,
      amount: rule.amount,
      date: dateStr,
    };

    const updatedTxs = [newTx, ...transactions];
    const updatedProcessed = [...processedRecurring, processKey];

    setTransactions(updatedTxs);
    setProcessedRecurring(updatedProcessed);

    saveState(isInitialized, initialBalance, updatedTxs, categories, recurringRules, updatedProcessed);
    showTempNotification(`Approved recurring payment: ${rule.name}`);
  };

  const handleCancelRecurring = (rule: RecurringRule) => {
    const processKey = `${rule.id}-${currentMonthKey}`;
    const updatedProcessed = [...processedRecurring, processKey];

    setProcessedRecurring(updatedProcessed);

    saveState(isInitialized, initialBalance, transactions, categories, recurringRules, updatedProcessed);
    showTempNotification(`Skipped recurring payment: ${rule.name} for this month`);
  };

  // Recurring Rules Settings
  const handleAddRecurringRule = (e: FormEvent) => {
    e.preventDefault();
    const name = newRecName.trim();
    const amount = parseFloat(newRecAmount);
    const day = parseInt(newRecDay);

    if (!name) {
      alert("Please enter a name.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (isNaN(day) || day < 1 || day > 31) {
      alert("Please enter a valid day of the month (1-31).");
      return;
    }

    const newRule: RecurringRule = {
      id: `rec-rule-${Date.now()}`,
      name,
      type: newRecType,
      category: activeRecCategory,
      amount,
      dayOfMonth: day,
    };

    const updatedRules = [...recurringRules, newRule];
    setRecurringRules(updatedRules);
    setNewRecName("");
    setNewRecAmount("");
    setNewRecDay("1");

    saveState(isInitialized, initialBalance, transactions, categories, updatedRules, processedRecurring);
    showTempNotification(`Recurring rule "${name}" scheduled for day ${day}.`);
  };

  const handleDeleteRecurringRule = (id: string) => {
    const rule = recurringRules.find((r) => r.id === id);
    const updatedRules = recurringRules.filter((r) => r.id !== id);
    setRecurringRules(updatedRules);

    saveState(isInitialized, initialBalance, transactions, categories, updatedRules, processedRecurring);
    if (rule) {
      showTempNotification(`Removed recurring rule: ${rule.name}`);
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
  };

  const handleDeleteLastMonthData = () => {
    if (confirm("Are you sure you want to delete all transactions from previous months?")) {
      const now = new Date();
      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfCurrentMonthTime = startOfCurrentMonth.getTime();

      const updatedTxs = transactions.filter((t) => {
        const [y, m, d] = t.date.split("-").map(Number);
        const txDate = new Date(y, m - 1, d);
        return txDate.getTime() >= startOfCurrentMonthTime;
      });

      setTransactions(updatedTxs);
      saveState(isInitialized, initialBalance, updatedTxs, categories, recurringRules, processedRecurring);
      showTempNotification("Deleted transactions from previous months.");
    }
  };

  // --- PHASE 1: ONBOARDING SCREEN ---
  if (!isInitialized) {
    return (
      <section className="flex flex-col items-center justify-center py-12 px-4 animate-fade-in-up">
        <div className="relative max-w-md w-full rounded-2xl border border-slate-800/80 bg-slate-900/40 p-8 text-center backdrop-blur-sm shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--rank-accent)]/30 bg-slate-950/70 shadow-[var(--rank-accent-glow-strong)]">
            <Wallet className="h-8 w-8 text-[var(--rank-accent)]" />
          </div>

          <h2 className="mt-6 text-2xl font-black text-white uppercase tracking-wider">
            Money Ledger Setup
          </h2>
          <p className="mt-3 text-slate-405 text-sm leading-relaxed">
            Welcome to the premium ledger workspace. Initialize your current total capital to begin logging income, tracking monthly budgets, and establishing recurring rosters.
          </p>

          <form onSubmit={handleInitialize} className="mt-8 space-y-6">
            <div className="flex flex-col gap-2 text-left">
              <label htmlFor="initialBalance" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Enter Current Total Capital / Balance ({currencySymbol})
              </label>
              <div className="relative flex items-center">
                <input
                  id="initialBalance"
                  type="number"
                  step="any"
                  placeholder="e.g. 5000"
                  required
                  value={onboardingInput}
                  onChange={(e) => setOnboardingInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-4 px-5 text-lg font-black text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-605 focus:border-[var(--rank-accent)] focus:ring-2 focus:ring-[var(--rank-accent)]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl py-4 font-black uppercase tracking-[0.15em] text-slate-950 bg-[var(--rank-accent)] hover:bg-[var(--rank-accent)]/90 active:scale-95 transition-all duration-100 shadow-[var(--rank-accent-glow-strong)] cursor-pointer"
            >
              Initialize Account
            </button>
          </form>
        </div>
      </section>
    );
  }

  // --- PHASE 2: ACTIVE WORKSPACE ---
  return (
    <section className="space-y-6 animate-fade-in-up">
      {/* Top Panel (Main Panel) */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center md:items-start text-center md:text-left shrink-0">
              <h1 className="text-3xl font-black text-white uppercase tracking-wider">
                Finance Desk
              </h1>
              <span className="text-[10px] font-black tracking-[0.2em] text-[var(--rank-accent)] mt-1.5 uppercase">
                Manage your wealth
              </span>
            </div>
          </div>
          {/* Notifications display */}
          <div className="flex items-center gap-2 self-end md:self-center">
            {notification && (
              <span className="mr-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 animate-pulse">
                {notification}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Telemetry / Status Row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-slate-800/80">
          {/* Today's Payment */}
          <div className="flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/50">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center shrink-0">
              <CreditCard className="h-5 w-5" style={{ color: "var(--rank-accent)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Today's Payment</p>
              <p className="text-sm font-black text-white mt-0.5">{currencySymbol}{todaysPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Total Profit or Loss */}
          <div className="flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/50">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center shrink-0">
              {totalProfitLoss >= 0 ? (
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-rose-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Total Profit or Loss</p>
              <p className={`text-sm font-black mt-0.5 ${totalProfitLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {totalProfitLoss >= 0 ? "+" : ""}{currencySymbol}{totalProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Total Money Left */}
          <div className="flex items-center gap-3 bg-slate-950/30 rounded-xl p-3 border border-slate-800/50">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5" style={{ color: "var(--rank-accent)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Total Money Left</p>
              <p className="text-sm font-black text-white mt-0.5">{currencySymbol}{netLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interceptor Prompt - High Visibility Banner */}
      {pendingRecurringTransactions.length > 0 && !autoApproveTransactions && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-[0_0_24px_rgba(245,158,11,0.08)] animate-pulse">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-950/40 text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-amber-200">
                  Gatekeeper Interceptor: Upcoming Recurring Transaction
                </h3>
                <div className="text-sm text-slate-300">
                  <span className="font-black text-white">{pendingRecurringTransactions[0].name}</span> due on day {pendingRecurringTransactions[0].dayOfMonth} (
                  <span className="font-semibold text-slate-100">{pendingRecurringTransactions[0].type === "income" ? "+" : "-"}{currencySymbol}{pendingRecurringTransactions[0].amount}</span>
                  ) requires authentication.
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => handleApproveRecurring(pendingRecurringTransactions[0])}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-500 active:scale-95 transition-all duration-100 cursor-pointer"
              >
                <Check className="h-4 w-4" /> Continue / Approve
              </button>
              <button
                type="button"
                onClick={() => handleCancelRecurring(pendingRecurringTransactions[0])}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all duration-100 cursor-pointer"
              >
                <X className="h-4 w-4" /> Cancel For This Month
              </button>
            </div>
          </div>
          {pendingRecurringTransactions.length > 1 && (
            <p className="mt-2 text-right text-[10px] font-bold text-amber-400/80">
              +{pendingRecurringTransactions.length - 1} more pending recurring authorization(s)...
            </p>
          )}
        </div>
      )}

      {/* Main Grid: Form Engine + Roster Manager */}
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">

        {/* Core Transaction Engine Panel */}
        <div className={`rounded-2xl border p-6 backdrop-blur-sm flex flex-col justify-between relative z-10 transition-all duration-550 ${
          txType === "income"
            ? "border-emerald-500/30 bg-emerald-950/2 shadow-[0_0_30px_rgba(16,185,129,0.08)]"
            : "border-rose-500/30 bg-rose-950/2 shadow-[0_0_30px_rgba(239,68,68,0.08)]"
        }`}>
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl border bg-slate-950/50 transition-colors duration-500 ${
                  txType === "income" ? "border-emerald-500/30 text-emerald-400" : "border-rose-500/30 text-rose-400"
                }`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-wide">LOG TRANSACTION</h3>
                  <p className="text-xs text-slate-400">Instantly record earnings or expenditures</p>
                </div>
              </div>

              {/* Transaction Type Toggle Button row */}
              <div className="relative inline-flex rounded-xl border border-slate-800 bg-slate-950/60 p-0.5 w-[220px] h-[36px] overflow-hidden">
                {/* Active sliding pill */}
                <div
                  className={`absolute top-0.5 bottom-0.5 left-0.5 w-[106px] rounded-lg transition-all duration-300 ease-out ${
                    txType === "income"
                      ? "transform translate-x-0 bg-emerald-500/15 border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                      : "transform translate-x-[108px] bg-rose-500/15 border border-rose-500/25 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setTxType("income")}
                  className={`relative z-10 w-[107px] py-1 text-xs font-black uppercase tracking-wider transition-colors duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                    txType === "income" ? "text-emerald-400 font-black" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ArrowUp className={`h-3.5 w-3.5 transition-transform duration-300 ${txType === "income" ? "scale-110" : ""}`} />
                  <span>Income</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTxType("expense")}
                  className={`relative z-10 w-[107px] py-1 text-xs font-black uppercase tracking-wider transition-colors duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                    txType === "expense" ? "text-rose-400 font-black" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ArrowDown className={`h-3.5 w-3.5 transition-transform duration-300 ${txType === "expense" ? "scale-110" : ""}`} />
                  <span>Expense</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="txName" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Transaction Name
                  </label>
                  <input
                    id="txName"
                    type="text"
                    placeholder="e.g. Office Supplies, Coffee"
                    required
                    value={txName}
                    onChange={(e) => setTxName(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-slate-500 focus:ring-2 focus:ring-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="txAmount" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Amount ({currencySymbol})
                  </label>
                  <input
                    id="txAmount"
                    type="number"
                    step="any"
                    min="0.01"
                    placeholder="e.g. 15.50"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className={`rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-500 ${txType === "income"
                        ? "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
                        : "focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25"
                      }`}
                  />
                </div>
              </div>

              <div className="relative flex flex-col gap-1.5">
                <label htmlFor="categorySelector" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Category Tag
                </label>
                <div className="flex gap-2">
                  <select
                    id="categorySelector"
                    value={activeTxCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-slate-500"
                  >
                    {categories.map((c) => {
                      const limitStatus = checkCategoryThreshold(c.name);
                      const hasLimit = c.monthlyLimit !== null;
                      const percent = Math.round(limitStatus.percent);
                      let bullet = "🟢";
                      if (hasLimit) {
                        if (percent >= 80) {
                          bullet = "🔴";
                        } else if (percent >= 60) {
                          bullet = "🟡";
                        }
                      }
                      const limitText = hasLimit ? ` (${percent}%)` : "";
                      const overLimitText = percent > 100 ? " [OVER LIMIT]" : "";
                      return (
                        <option key={c.name} value={c.name}>
                          {bullet} {c.name}{limitText}{overLimitText}
                        </option>
                      );
                    })}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryCreator(!showCategoryCreator);
                    }}
                    className={`flex items-center justify-center w-11 h-11 shrink-0 rounded-xl border transition-all active:scale-95 duration-100 cursor-pointer ${showCategoryCreator
                        ? "border-[var(--rank-accent)] bg-[var(--rank-accent)]/15 text-white"
                        : "border-slate-700 bg-slate-950/70 text-slate-400 hover:text-white"
                      }`}
                    title="Create custom category"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                {(() => {
                  const limitStatus = checkCategoryThreshold(activeTxCategory);
                  const cat = categories.find((c) => c.name === activeTxCategory);
                  if (!cat || cat.monthlyLimit === null) return null;
                  
                  const percent = Math.round(limitStatus.percent);
                  if (percent < 60) return null;

                  let textColor = "text-amber-455";
                  let dotColor = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
                  
                  if (percent >= 80) {
                    textColor = "text-red-400";
                    dotColor = "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse";
                  }

                  return (
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${dotColor}`} />
                      <p className={`text-xs font-bold ${textColor} flex items-center gap-1.5`}>
                        Warning: {activeTxCategory} is at {percent}% of spending limit!
                      </p>
                      {percent > 100 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-red-155 bg-red-950/90 border border-red-800 shadow-[0_0_12px_rgba(239,68,68,0.95)] animate-pulse">
                          OVER LIMIT
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* Inline Category Creator Tool Popover */}
                {showCategoryCreator && (
                  <div className="absolute bottom-full mb-2 right-0 z-50 w-full sm:w-[680px] rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] animate-fade-in-up">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2 mb-4">
                      {editingCategoryOriginalName ? `Edit Category: ${editingCategoryOriginalName}` : "Create Custom Category"}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Left: Add / Edit Form */}
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                          <label htmlFor="newCatName" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Category Name
                          </label>
                          <input
                            id="newCatName"
                            type="text"
                            placeholder="e.g. Shopping, Health"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-slate-650"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label htmlFor="newCatLimit" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Monthly Spending Cap (Limit)
                          </label>
                          <input
                            id="newCatLimit"
                            type="number"
                            placeholder="Optional (e.g. 200)"
                            value={newCatLimit}
                            onChange={(e) => setNewCatLimit(e.target.value)}
                            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-slate-650"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="newCatColor" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Category Color Tag
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              id="newCatColor"
                              type="color"
                              value={newCatColor}
                              onChange={(e) => setNewCatColor(e.target.value)}
                              className="w-10 h-10 rounded-lg border border-slate-800 bg-slate-950 p-1 cursor-pointer outline-none transition-all focus:border-slate-600"
                            />
                            <span className="text-xs font-mono text-slate-350 font-bold uppercase tracking-wider bg-slate-950 px-2.5 py-1.5 rounded-md border border-slate-850">
                              {newCatColor}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                          {editingCategoryOriginalName ? (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryOriginalName(null);
                                setNewCatName("");
                                setNewCatColor("#ef4444");
                                setNewCatLimit("");
                              }}
                              className="rounded-lg border border-slate-805 px-3 py-1.5 text-2xs font-bold uppercase tracking-wider text-slate-400 hover:text-white"
                            >
                              Cancel Edit
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowCategoryCreator(false)}
                              className="rounded-lg border border-slate-800 px-3 py-1.5 text-2xs font-bold uppercase tracking-wider text-slate-400 hover:text-white"
                            >
                              Close
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleSaveCategory}
                            className="rounded-lg bg-[var(--rank-accent)] px-3 py-1.5 text-2xs font-black uppercase tracking-wider text-slate-955 active:scale-95 transition-transform duration-100 cursor-pointer"
                          >
                            {editingCategoryOriginalName ? "Update" : "Save"}
                          </button>
                        </div>
                      </div>

                      {/* Right: Existing Categories Manager Table */}
                      <div className="md:border-l md:border-slate-800 md:pl-6 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Existing Categories
                          </h5>
                          <span className="text-[9px] font-mono text-slate-500 font-bold">
                            {categories.length} total
                          </span>
                        </div>
                        <div className="max-h-[220px] overflow-y-auto pr-1">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-800 text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                                <th className="py-1 pb-2">Tag</th>
                                <th className="py-1 pb-2">Limit</th>
                                <th className="py-1 pb-2 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                              {categories.map((c) => (
                                <tr key={c.name} className="hover:bg-slate-950/20 transition-colors">
                                  <td className="py-2 flex items-center gap-2">
                                    <span
                                      className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                                      style={{ backgroundColor: c.color }}
                                    />
                                    <span className="font-bold text-slate-200 truncate max-w-[120px]" title={c.name}>
                                      {c.name}
                                    </span>
                                  </td>
                                  <td className="py-2 text-slate-400 font-mono text-[10px]">
                                    {c.monthlyLimit !== null ? `${currencySymbol}${c.monthlyLimit}` : "None"}
                                  </td>
                                  <td className="py-2 text-right">
                                    <div className="inline-flex gap-1.5 justify-end">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingCategoryOriginalName(c.name);
                                          setNewCatName(c.name);
                                          setNewCatColor(c.color);
                                          setNewCatLimit(c.monthlyLimit !== null ? String(c.monthlyLimit) : "");
                                        }}
                                        className="p-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white active:scale-90 transition-all cursor-pointer"
                                        title="Edit category"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCategory(c.name)}
                                        className="p-1 rounded bg-slate-850 hover:bg-slate-800 text-rose-450 hover:text-rose-400 active:scale-90 transition-all cursor-pointer"
                                        title="Delete category"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-slate-200 transition-all duration-100 hover:bg-slate-900 active:scale-95 cursor-pointer shadow-lg"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Recurring Profiles Panel */}
        <div className="rounded-2xl border border-slate-800/85 bg-slate-900/40 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/50">
                  <Calendar className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-wide">RECURRING ROSTER</h3>
                  <p className="text-xs text-slate-400">Scheduled monthly bills & deposits</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRecurringManager(!showRecurringManager)}
                className="rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-2xs font-black uppercase tracking-wider text-purple-200 hover:bg-purple-500/20 active:scale-95 transition-all duration-100 cursor-pointer"
              >
                {showRecurringManager ? "View Active Roster" : "Manage Recurring Rules"}
              </button>
            </div>

            {showRecurringManager ? (
              /* Recurring Rules Builder & Manager */
              <div className="space-y-4">
                <form onSubmit={handleAddRecurringRule} className="border border-slate-800/80 bg-slate-950/35 p-4 rounded-xl space-y-3 animate-fade-in-up">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-300">
                    Schedule New Recurring Rule
                  </h4>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="newRecName" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Rule Name
                      </label>
                      <input
                        id="newRecName"
                        type="text"
                        placeholder="e.g. Rent, Gym"
                        required
                        value={newRecName}
                        onChange={(e) => setNewRecName(e.target.value)}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="newRecAmount" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Amount ({currencySymbol})
                      </label>
                      <input
                        id="newRecAmount"
                        type="number"
                        step="any"
                        placeholder="e.g. 50"
                        required
                        value={newRecAmount}
                        onChange={(e) => setNewRecAmount(e.target.value)}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Type
                      </span>
                      <select
                        value={newRecType}
                        onChange={(e) => setNewRecType(e.target.value as TransactionType)}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-white outline-none focus:border-purple-500"
                      >
                        <option value="expense">Expense (-)</option>
                        <option value="income">Income (+)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="newRecCategorySelect" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Category
                      </label>
                      <select
                        id="newRecCategorySelect"
                        value={activeRecCategory}
                        onChange={(e) => setNewRecCategory(e.target.value)}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-white outline-none focus:border-purple-500"
                      >
                        {categories.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="newRecDay" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Billing Day (1-31)
                      </label>
                      <input
                        id="newRecDay"
                        type="number"
                        min="1"
                        max="31"
                        required
                        value={newRecDay}
                        onChange={(e) => setNewRecDay(e.target.value)}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-2xs font-black uppercase tracking-wider text-white active:scale-95 transition-transform duration-105 cursor-pointer"
                    >
                      Schedule Rule
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Active Recurring Rules Roster */
              <div className="space-y-3">
                {recurringRules.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-850 p-8 text-center text-slate-500 text-sm">
                    No recurring transaction profiles scheduled.
                  </div>
                ) : (
                  <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2">
                    {recurringRules.map((rule) => {
                      const categoryData = categories.find((c) => c.name === rule.category);
                      const catColor = categoryData?.color || "#64748b";

                      return (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/20 hover:bg-slate-950/45 transition-all duration-150"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-200 text-sm truncate">{rule.name}</span>
                              <span
                                className="rounded px-1.5 py-0.5 text-[9px] font-bold"
                                style={{
                                  backgroundColor: `${catColor}15`,
                                  color: catColor,
                                  border: `1px solid ${catColor}30`,
                                }}
                              >
                                {rule.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-505 mt-0.5 font-mono">
                              Due: Day {rule.dayOfMonth} of month
                            </p>
                          </div>

                          <div className="flex items-center gap-3 ml-3">
                            <span className={`font-mono text-sm font-bold ${rule.type === "income" ? "text-emerald-400" : "text-slate-400"
                              }`}>
                              {rule.type === "income" ? "+" : "-"}{currencySymbol}{rule.amount}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteRecurringRule(rule.id)}
                              className="rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/60 p-2 text-slate-405 hover:text-rose-450 active:scale-95 transition-transform duration-100 cursor-pointer"
                              title="Delete recurring rule"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* History Log Ledger */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-slate-850 pb-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
              <History className="h-5 w-5 text-[var(--rank-accent)]" />
              RECENT TRANSACTION HISTORY LOG
            </h2>
            <p className="text-xs text-slate-400">
              Complete active registry of transactions logged in the current monthly cycle
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowLimitManager(!showLimitManager)}
              className={`rounded-xl border px-3 py-2 text-2xs font-bold uppercase tracking-wider transition-all duration-100 flex items-center gap-1.5 cursor-pointer ${
                showLimitManager
                  ? "border-[var(--rank-accent)] bg-[var(--rank-accent)]/15 text-white"
                  : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              {showLimitManager ? "Hide Spending Limits" : "Manage Spending Limits"}
            </button>

            <button
              type="button"
              onClick={handleDeleteLastMonthData}
              className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-2xs font-bold uppercase tracking-wider text-rose-350 hover:bg-rose-500/15 active:scale-95 transition-all duration-105 cursor-pointer"
            >
              Delete last month & older data
            </button>
          </div>
        </div>

        {/* Collapsible Category Spending Limits Workspace */}
        {showLimitManager && (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/40 p-4 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-900 pb-2">
              <Sliders className="h-4 w-4 text-[var(--rank-accent)]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Category Spending Caps / Limits Configurator
              </h3>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((c) => {
                const spent = categoryExpenses[c.name] || 0;
                return (
                  <div
                    key={c.name}
                    className="flex flex-col justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/50 transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black uppercase tracking-wide truncate" style={{ color: c.color }}>
                          {c.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Spent: {currencySymbol}{spent.toFixed(0)}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-0.5 font-bold">
                        Cap Limit: {c.monthlyLimit ? `${currencySymbol}${c.monthlyLimit}` : "No Limit"}
                      </p>
                    </div>

                    <div className="flex gap-1.5 items-center mt-3">
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-2xs font-mono">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          placeholder="No Limit"
                          className="w-full rounded border border-slate-800 bg-slate-950 pl-5 pr-2 py-1 text-2xs text-white outline-none focus:border-slate-700"
                          value={c.monthlyLimit !== null ? c.monthlyLimit : ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const limitVal = val.trim() !== "" ? parseFloat(val) : null;
                            setCategories((prev) =>
                              prev.map((cat) =>
                                cat.name === c.name ? { ...cat, monthlyLimit: limitVal } : cat
                              )
                            );
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          saveState(isInitialized, initialBalance, transactions, categories, recurringRules, processedRecurring);
                          showTempNotification(`Limit for "${c.name}" updated!`);
                        }}
                        className="rounded bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 text-2xs font-bold text-white active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/20 p-12 text-center text-slate-500 text-sm">
            No transactions registered. Enter transactions above or approve recurring alerts to populate.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Transaction Name</th>
                  <th className="py-3 px-4">Earning/Expense</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {transactions.map((tx) => {
                  const categoryData = categories.find((c) => c.name === tx.category);
                  const baseColor = categoryData?.color || "#64748b";

                  const limitStatus = tx.type === "expense" ? checkCategoryThreshold(tx.category) : { exceeded: false, percent: 0 };
                  const badgeStyle = {
                    backgroundColor: `${baseColor}15`,
                    borderColor: baseColor,
                    color: baseColor,
                  };

                  return (
                    <tr key={tx.id} className="hover:bg-slate-950/15 transition-colors duration-150">
                      <td className="py-3.5 px-4 font-bold text-slate-200">
                        {tx.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-2xs font-bold ${
                          tx.type === "income"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {tx.type === "income" ? "Earning" : "Expense"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all"
                          style={badgeStyle}
                        >
                          {(() => {
                            const hasLimit = categoryData?.monthlyLimit !== null;
                            const percent = limitStatus.percent;
                            let dotColor = "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]";
                            if (hasLimit) {
                              if (percent >= 80) {
                                dotColor = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse";
                              } else if (percent >= 60) {
                                dotColor = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]";
                              }
                            }
                            return (
                              <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${dotColor}`} />
                            );
                          })()}
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedTxForBill(tx)}
                            className="rounded-lg border border-slate-700 bg-slate-900/60 p-2 text-slate-350 hover:text-white hover:bg-slate-800 transition-all duration-100 active:scale-95 cursor-pointer"
                            aria-label={`View receipt for ${tx.name}`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="rounded-lg border border-rose-500/10 bg-rose-500/5 p-2 text-rose-350 hover:text-rose-400 hover:bg-rose-500/15 transition-all duration-100 active:scale-95 cursor-pointer"
                            aria-label={`Delete transaction ${tx.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dot Matrix Bill Receipt Modal */}
      {selectedTxForBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <style dangerouslySetInnerHTML={{ __html: `
            @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
            .dot-matrix {
              font-family: 'VT323', 'Courier New', Courier, monospace;
              letter-spacing: 0.05em;
            }
          `}} />
          <div className="relative max-w-xl w-full bg-[#f4f3ef] text-[#1a1a1a] border border-[#d5d4cd] rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 transform scale-100 flex flex-col font-mono">
            {/* Perforated Top edge decorative element */}
            <div className="w-full h-3 bg-[radial-gradient(circle_at_bottom,_transparent_4px,_#f4f3ef_5px)] bg-[length:12px_12px]" />
            
            <div className="p-6 flex-1 flex flex-col">
              {/* Receipt Header Info */}
              <div className="flex justify-between items-center text-xs border-b border-dashed border-slate-400 pb-3 mb-4 dot-matrix text-lg font-bold">
                <div>DATE: {selectedTxForBill.date}</div>
                <div>CAT: {selectedTxForBill.category.toUpperCase()}</div>
              </div>

              {/* Transaction Alert Title */}
              <div className="text-center font-bold text-2xl tracking-wide dot-matrix mb-4 border-b border-dashed border-slate-400 pb-2">
                * TRANSACTION ALERT *
              </div>

              {/* Bill Card Content */}
              <div className="flex-1 py-4 dot-matrix text-xl space-y-1 text-left md:pl-10">
                <div>Transaction Type : {selectedTxForBill.type === "income" ? "CREDIT" : "DEBIT"}</div>
                <div>Amount           : ₹{selectedTxForBill.amount}</div>
                <div>Purpose/Merchant : {selectedTxForBill.name}</div>
                <div>Status           : COMPLETED</div>
              </div>

              {/* Remaining budget limit percentage (if applicable) */}
              {(() => {
                const cat = categories.find((c) => c.name === selectedTxForBill.category);
                if (selectedTxForBill.type === "expense" && cat && cat.monthlyLimit !== null && cat.monthlyLimit > 0) {
                  const limitAmount = cat.monthlyLimit;
                  const spentAmount = categoryExpenses[cat.name] || 0;
                  
                  if (spentAmount === limitAmount) {
                    return (
                      <div className="mt-6 border-t border-dashed border-slate-400 pt-3 text-left md:pl-10 dot-matrix text-lg font-normal space-y-1">
                        <div>Total limit for this category reached.</div>
                      </div>
                    );
                  } else if (spentAmount > limitAmount) {
                    const extraAmount = spentAmount - limitAmount;
                    return (
                      <div className="mt-6 border-t border-dashed border-slate-400 pt-3 text-left md:pl-10 dot-matrix text-lg font-normal space-y-1">
                        <div>Total limit for this category has been exceeded.</div>
                        <div>Extra amount spent: ₹{extraAmount.toFixed(2)}</div>
                      </div>
                    );
                  } else {
                    const usedPercent = Math.round((spentAmount / limitAmount) * 100);
                    const remainingAmount = limitAmount - spentAmount;
                    return (
                      <div className="mt-6 border-t border-dashed border-slate-400 pt-3 text-left md:pl-10 dot-matrix text-lg font-normal space-y-1">
                        <div>Total limit for this category: ₹{limitAmount} (Currently used: {usedPercent}%)</div>
                        <div>Remaining amount: ₹{remainingAmount.toFixed(2)}</div>
                      </div>
                    );
                  }
                }
                return null;
              })()}

              {/* Perforated Divider */}
              <div className="border-b border-dashed border-slate-400 my-4" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedTxForBill(null)}
                className="w-full bg-slate-900 text-white py-2 px-4 rounded font-bold uppercase tracking-wider text-xs hover:bg-slate-800 transition-all duration-100 active:scale-95 cursor-pointer dot-matrix text-lg"
              >
                Close Receipt
              </button>
            </div>
            
            {/* Perforated Bottom edge decorative element */}
            <div className="w-full h-3 bg-[radial-gradient(circle_at_top,_transparent_4px,_#f4f3ef_5px)] bg-[length:12px_12px] bg-repeat-x" />
          </div>
        </div>
      )}
    </section>
  );
}
