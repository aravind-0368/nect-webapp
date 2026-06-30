"use client";

import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./components/LoginPage";
import { createClient } from "../utils/supabase/client";
import { useNectStore } from "./store/useNectStore";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const supabase = createClient();
  const { setUserId, setPoints, setPowerStreak, setSmartStreak, setHealthyStreak, resetAll } = useNectStore();

  useEffect(() => {
    // 1. Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        setIsAuthenticated(true);
        // Fetch user profile stats
        const { data: profile } = await supabase
          .from("User")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        if (profile) {
          setPoints(profile.totalPoints);
          setPowerStreak(profile.workoutStreak);
          setSmartStreak(profile.learningStreak);
          setHealthyStreak(profile.foodStreak);
        }
      } else {
        setIsAuthenticated(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setIsAuthenticated(true);
        
        // Fetch user profile stats on sign in
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          const { data: profile } = await supabase
            .from("User")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();
          if (profile) {
            setPoints(profile.totalPoints);
            setPowerStreak(profile.workoutStreak);
            setSmartStreak(profile.learningStreak);
            setHealthyStreak(profile.foodStreak);
          }
        }
      } else {
        resetAll();
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#020212] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#5B009C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono tracking-widest text-slate-500 uppercase animate-pulse">
            Verifying registry connection...
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <AppShell onLogout={async () => {
      await supabase.auth.signOut();
      resetAll();
      setIsAuthenticated(false);
    }} />
  ) : (
    <LoginPage onAuthenticated={() => setIsAuthenticated(true)} />
  );
}
