"use client";

import { useState } from "react";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./components/LoginPage";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return isAuthenticated ? (
    <AppShell onLogout={() => setIsAuthenticated(false)} />
  ) : (
    <LoginPage onAuthenticated={() => setIsAuthenticated(true)} />
  );
}
