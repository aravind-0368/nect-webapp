"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import ReactConfetti from "react-confetti";

interface FireStreakProps {
  streakValue: number;
  streakType: "Power" | "Smart" | "Healthy";
  className?: string;
}

export function FireStreak({ streakValue, streakType, className = "" }: FireStreakProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
  const [sourcePos, setSourcePos] = useState({ x: 0, y: 0, w: 10, h: 10 });
  
  const elementRef = useRef<HTMLDivElement>(null);
  const prevStreakRef = useRef<number>(streakValue);

  // Update window size for Confetti canvas size
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Monitor milestone trigger (7 or 30 days)
  useEffect(() => {
    const prevVal = prevStreakRef.current;
    prevStreakRef.current = streakValue;

    if (streakValue !== prevVal && (streakValue === 7 || streakValue === 30)) {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        // Since react-confetti is fixed overlay, add scroll offsets to viewport coordinates
        const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
        const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
        setSourcePos({
          x: rect.left + scrollX,
          y: rect.top + scrollY,
          w: rect.width,
          h: rect.height
        });
      }
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [streakValue]);

  const isUncharged = streakValue === 0;
  const isCharged = streakValue >= 1 && streakValue <= 6;
  const isSupercharged = streakValue >= 7;

  return (
    <div ref={elementRef} className={`relative inline-flex items-center gap-1.5 ${className}`}>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={120}
            gravity={0.15}
            confettiSource={sourcePos}
          />
        </div>
      )}

      {/* Flame Icon Container with heartbeat states */}
      <motion.div
        animate={isSupercharged ? { scale: [1, 1.2, 1] } : {}}
        transition={
          isSupercharged
            ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
            : undefined
        }
        className="relative flex items-center justify-center cursor-pointer active:scale-90 transition-transform duration-100"
        style={{
          color: isUncharged ? "#475569" : "var(--rank-accent)",
          filter: isSupercharged ? "drop-shadow(0 0 10px var(--rank-accent))" : "none",
          opacity: isUncharged ? 0.45 : 1,
        }}
        title={`${streakType} Streak: ${streakValue} Days`}
      >
        <Flame className="h-6 w-6 fill-current" />
      </motion.div>

      {/* Streak Count Text */}
      <span className="text-sm font-black text-slate-100 tracking-wider">
        {streakValue} <span className="text-2xs font-bold text-slate-500 uppercase tracking-widest">Days</span>
      </span>
    </div>
  );
}
