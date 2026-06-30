"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Award, ChevronRight } from "lucide-react";
import ReactConfetti from "react-confetti";
import { useNectStore, getActiveRank, rankTiers } from "../store/useNectStore";

export function RankUpOverlay() {
  const { showRankUpOverlay, rankUpFrom, rankUpTo, dismissRankUp } = useNectStore();
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });

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

  const newRankDetails = rankTiers.find((t) => t.name === rankUpTo) || rankTiers[0];

  return (
    <AnimatePresence>
      {showRankUpOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
          {/* Confetti Explosion */}
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={250}
            recycle={true}
          />

          {/* Dimmed glassmorphic backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissRankUp}
            className="absolute inset-0 bg-slate-955/85 backdrop-blur-md cursor-pointer"
          />

          {/* Metallic Rank Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -30 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="relative max-w-lg w-full mx-4 rounded-3xl border p-8 text-center bg-slate-900/90 shadow-[0_0_80px_var(--rank-accent)] z-10 flex flex-col items-center"
            style={{
              borderColor: `${newRankDetails.color}50`,
              boxShadow: `0 0 60px ${newRankDetails.color}20, inset 0 0 30px ${newRankDetails.color}15`
            }}
          >
            {/* Holographic Ring / Icon */}
            <div 
              className="flex h-24 w-24 items-center justify-center rounded-2xl border bg-slate-950/90 mb-6 shadow-2xl overflow-hidden"
              style={{ 
                borderColor: newRankDetails.color,
                boxShadow: `0 0 30px ${newRankDetails.color}25`
              }}
            >
              <img
                src={`/assets/ranks/${newRankDetails.name.toLowerCase()}.svg`}
                alt={`${newRankDetails.name} Rank Badge`}
                className="h-16 w-16 object-contain animate-pulse"
              />
            </div>

            <p className="text-2xs font-black uppercase tracking-[0.35em] text-emerald-400">
              Cosmic Alignment Shifted
            </p>
            
            <h2 
              className="mt-2 text-4xl font-black tracking-widest text-white uppercase select-none drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              RANK UPGRADED
            </h2>

            <div className="mt-8 flex items-center justify-center gap-4 bg-slate-950/60 rounded-2xl border border-slate-800 p-5 w-full">
              <div className="text-center flex-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Previous</span>
                <p className="text-sm font-black text-slate-400 mt-1 uppercase tracking-wide">{rankUpFrom}</p>
              </div>
              <ChevronRight className="h-6 w-6 text-slate-600 shrink-0" />
              <div className="text-center flex-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Ascended</span>
                <p 
                  className="text-lg font-black mt-1 uppercase tracking-widest"
                  style={{ color: newRankDetails.color }}
                >
                  {rankUpTo}
                </p>
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-400 max-w-xs leading-relaxed italic">
              &ldquo;{newRankDetails.description}&rdquo;
            </p>

            <button
              type="button"
              onClick={dismissRankUp}
              className="mt-8 w-full rounded-xl py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-950 hover:opacity-95 transition-opacity active:scale-98 shadow-lg cursor-pointer"
              style={{ backgroundColor: newRankDetails.color }}
            >
              Accept Cosmic Mandate
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
