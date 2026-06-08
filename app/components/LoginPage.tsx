"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";

type AuthView = "login" | "signup" | "forgot";

type LoginPageProps = {
  onAuthenticated: () => void;
};

const inputClass =
  "w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500";

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [authView, setAuthView] = useState<AuthView>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordsMismatch = useMemo(
    () => confirmPassword.length > 0 && signupPassword !== confirmPassword,
    [confirmPassword, signupPassword],
  );

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAuthenticated();
  }

  function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (passwordsMismatch) {
      return;
    }

    onAuthenticated();
  }

  function handleForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#070814] px-5 py-8 text-slate-100 sm:px-8">
      <div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl animate-glow-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl animate-glow-pulse pointer-events-none" />
      <div className="absolute right-1/3 top-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl animate-glow-pulse pointer-events-none" />

      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-8">
          <div className="animate-float space-y-5">
            <Image
              src="/assets/logo/main-logo.png"
              alt="Nect logo"
              width={260}
              height={88}
              priority
              className="h-auto w-56 sm:w-64"
            />
            <div>
              <h1 className="text-balance bg-gradient-to-r from-indigo-300 via-purple-300 to-emerald-300 bg-clip-text text-4xl font-black tracking-wide text-transparent sm:text-5xl">
                Level Up Your Life
              </h1>
              <p className="mt-3 max-w-xl text-lg text-slate-300">
                One module at a time. Build streaks, earn points, and keep your
                day moving from one command center.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoPanel
              title="Total Life Gamification"
              body="Stop tracking your life on messy spreadsheets. Nect treats your daily habits like an RPG with experience points, consistency streaks, and personal metrics that level up across learning, fitness, and finance."
            />
            <InfoPanel
              title="Unified Command Center"
              body="Context switching ruins focus. Nect brings tasks, budget, workouts, food targets, and study progress into one working surface so management time turns back into execution time."
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
            {[
              "Learning Hub",
              "Exercise Tracker",
              "Food Diary",
              "Ledger Matrix",
              "Tasks and Agenda",
            ].map((label) => (
              <span
                key={label}
                className="rounded-full border border-cyan-300/20 bg-slate-900/50 px-3 py-2 shadow-[0_0_24px_rgba(34,211,238,0.08)]"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-7 shadow-2xl backdrop-blur-md animate-fade-in-up sm:p-8">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-slate-950">
              <Image
                src="/assets/logo/favicon.png"
                alt="Nect favicon"
                width={32}
                height={32}
                className="h-8 w-8"
              />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Nect Access
              </p>
              <p className="text-sm text-slate-400">
                Local prototype authentication
              </p>
            </div>
          </div>

          <div key={authView} className="animate-fade-in-up">
            {authView === "login" && (
              <form className="space-y-5" onSubmit={handleLogin}>
                <FormHeader
                  title="Welcome Back"
                  subtitle="Enter your credentials to open the Nect dashboard."
                />
                <input className={inputClass} placeholder="Username" required />
                <PasswordInput
                  show={showPassword}
                  onToggle={() => setShowPassword((value) => !value)}
                  placeholder="Password"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                    onClick={() => setAuthView("forgot")}
                  >
                    Forgot Password?
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-indigo-500 active:scale-[0.98]"
                >
                  Sign In
                </button>
                <AuthFooter
                  text="New to Nect?"
                  action="Create an account"
                  onClick={() => setAuthView("signup")}
                />
              </form>
            )}

            {authView === "signup" && (
              <form className="space-y-5" onSubmit={handleSignup}>
                <FormHeader
                  title="Create Your Account"
                  subtitle="Start building your rank history and module streaks."
                />
                <input className={inputClass} placeholder="Username" required />
                <input
                  className={inputClass}
                  placeholder="Email Address"
                  required
                  type="email"
                />
                <PasswordInput
                  show={showSignupPassword}
                  onToggle={() => setShowSignupPassword((value) => !value)}
                  placeholder="Password"
                  value={signupPassword}
                  onChange={setSignupPassword}
                  isInvalid={passwordsMismatch}
                />
                <input
                  className={`${inputClass} ${
                    passwordsMismatch
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                      : ""
                  }`}
                  placeholder="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
                {passwordsMismatch && (
                  <p className="text-sm font-medium text-rose-300">
                    Passwords do not match.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={passwordsMismatch}
                  className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:hover:scale-100"
                >
                  Create Account
                </button>
                <AuthFooter
                  text="Already have an account?"
                  action="Log In"
                  onClick={() => setAuthView("login")}
                />
              </form>
            )}

            {authView === "forgot" && (
              <form className="space-y-5" onSubmit={handleForgot}>
                <FormHeader
                  title="Reset Password"
                  subtitle="Enter your registered email below and we will dispatch a secure recovery token link to restore your account access status."
                />
                <input
                  className={inputClass}
                  placeholder="Email Address"
                  required
                  type="email"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-cyan-600 py-3 font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-cyan-500 active:scale-[0.98]"
                >
                  Send Reset Link
                </button>
                <AuthFooter
                  text="Remembered your access?"
                  action="Back to Login"
                  onClick={() => setAuthView("login")}
                />
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoPanel({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5 backdrop-blur-sm">
      <h2 className="text-base font-bold text-slate-50">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
    </article>
  );
}

function FormHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
    </div>
  );
}

function PasswordInput({
  show,
  onToggle,
  placeholder,
  value,
  onChange,
  isInvalid = false,
}: {
  show: boolean;
  onToggle: () => void;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  isInvalid?: boolean;
}) {
  return (
    <div className="relative">
      <input
        className={`${inputClass} pr-20 ${
          isInvalid ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""
        }`}
        placeholder={placeholder}
        type={show ? "text" : "password"}
        value={value}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
        required
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 transition-colors hover:text-white"
        onClick={onToggle}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}

function AuthFooter({
  text,
  action,
  onClick,
}: {
  text: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <p className="text-center text-sm text-slate-400">
      {text}{" "}
      <button
        type="button"
        className="font-semibold text-emerald-300 transition-colors hover:text-emerald-200"
        onClick={onClick}
      >
        {action}
      </button>
    </p>
  );
}
