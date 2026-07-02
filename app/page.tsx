"use client";

import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./components/LoginPage";
import { useNectStore } from "./store/useNectStore";
import { createClient } from "../utils/supabase/client";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const {
    setUserId,
    setPoints,
    setPowerStreak,
    setSmartStreak,
    setHealthyStreak,
  } = useNectStore();

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          return;
        }

        const { data: profile } = await supabase
          .from("User")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        if (!isMounted) {
          return;
        }

        if (profile) {
          setPoints(profile.totalPoints);
          setPowerStreak(profile.workoutStreak);
          setSmartStreak(profile.learningStreak);
          setHealthyStreak(profile.foodStreak);
        }

        setUserId(data.user.id);
        setIsAuthenticated(true);
      } finally {
        if (isMounted) {
          setIsRestoringSession(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [setHealthyStreak, setPoints, setPowerStreak, setSmartStreak, setUserId]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserId(null);
    setIsAuthenticated(false);
  }

  if (isRestoringSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020212] text-xs font-mono uppercase tracking-[0.28em] text-[#c084fc]">
        Initializing session...
      </main>
    );
  }

  return isAuthenticated ? (
    <AppShell onLogout={handleLogout} />
  ) : (
    <LoginPage onAuthenticated={() => setIsAuthenticated(true)} />
  );
}
