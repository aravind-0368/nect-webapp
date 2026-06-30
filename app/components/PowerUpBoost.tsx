"use client";

import { useEffect, useState, useMemo } from "react";
import { Zap } from "lucide-react";
import { useNectStore } from "../store/useNectStore";

interface PowerUpBoostProps {
  moduleKey: string;
  children: React.ReactNode;
}

export function PowerUpBoost({ moduleKey, children }: PowerUpBoostProps) {
  const { activeBoosts, activateBoost } = useNectStore();
  const [timeLeft, setTimeLeft] = useState(0);

  const expirationTime = useMemo(() => {
    return activeBoosts[moduleKey] || 0;
  }, [activeBoosts, moduleKey]);

  useEffect(() => {
    if (!expirationTime) return;

    const checkTime = () => {
      const now = Date.now();
      const diff = expirationTime - now;
      if (diff <= 0) {
        setTimeLeft(0);
      } else {
        setTimeLeft(diff);
        requestAnimationFrame(checkTime);
      }
    };

    checkTime();
  }, [expirationTime]);

  const isActive = timeLeft > 0;
  const pctLeft = isActive ? Math.max(0, Math.min(100, (timeLeft / 60000) * 100)) : 0;
  const secondsLeft = Math.ceil(timeLeft / 1000);

  const handleActivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) return;
    // Activate for 60 seconds
    activateBoost(moduleKey, 60000);
  };

  return (
    <div className="relative group/boost cursor-pointer select-none">
      {/* Wrapped category icon children */}
      <div
        className="transition-all duration-300"
        style={{
          filter: isActive ? "drop-shadow(0 0 8px var(--rank-accent))" : "none",
        }}
      >
        {children}
      </div>

      {/* Boost Action Overlay (Hover state when inactive) */}
      {!isActive && (
        <button
          type="button"
          onClick={handleActivate}
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-slate-950/80 border border-amber-500/30 opacity-0 group-hover/boost:opacity-100 transition-all duration-200 cursor-pointer active:scale-95 z-10"
        >
          <Zap className="h-5 w-5 text-amber-400 animate-bounce" />
          <span className="text-[9px] font-black uppercase text-amber-300 tracking-widest mt-1">
            BOOST
          </span>
        </button>
      )}

      {/* Active Boost Progress Overlay */}
      {isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-slate-950/85 border border-[var(--rank-accent)]/40 pointer-events-none z-10 overflow-hidden">
          <Zap className="h-4 w-4 text-[var(--rank-accent)] animate-pulse" />
          <span className="text-[10px] font-black text-slate-100 tracking-wider mt-0.5">
            {secondsLeft}s
          </span>
          <span className="text-[7px] font-bold text-emerald-400 tracking-widest uppercase">
            +2% XP
          </span>

          {/* Decaying linear progress bar overlay at the base of the icon */}
          <div className="absolute bottom-0 left-0 h-1 bg-[var(--rank-accent)]/30 w-full">
            <div
              className="h-full bg-[var(--rank-accent)] shadow-[0_0_8px_var(--rank-accent)] transition-all duration-100 ease-linear"
              style={{ width: `${pctLeft}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
