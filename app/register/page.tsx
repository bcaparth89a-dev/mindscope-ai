"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Mail, Lock, Brain, UserPlus, LogIn, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async () => {
    try {
      setLoading(true);
      setError("");

      if (!email.trim() || !password.trim()) {
        setError("Please fill in both fields.");
        return;
      }

      if (password.length < 6) {
        setError("Password should be at least 6 characters long.");
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      alert("Account created successfully!");
      router.push("/login");
    } catch (err) {
      console.error(err);
      setError("Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07050a] px-4 py-12 select-none">
      {/* Dynamic drifting grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Atmospheric neon glows */}
      <div className="absolute top-1/4 left-10 w-80 h-80 rounded-full bg-violet-600/10 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }} />

      {/* Floating center orb */}
      <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: "10s" }} />

      <div className="relative w-full max-w-md z-10 transition-all duration-500 hover:scale-[1.01]">
        {/* Sleek Glassmorphism Card */}
        <div className="glass-panel-glow rounded-[2rem] p-8 sm:p-10 shadow-2xl">
          {/* Logo Heading */}
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/5 shadow-[0_0_20px_rgba(139,92,246,0.1)] relative group">
              <div className="absolute inset-0 rounded-2xl border border-violet-400/20 animate-pulse group-hover:scale-105 transition-transform" />
              <Brain className="h-10 w-10 text-violet-400 drop-shadow-[0_0_10px_rgba(139,92,246,0.4)]" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-indigo-100 to-violet-200 bg-clip-text text-transparent">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-indigo-200/50 font-medium tracking-wide">
              Start your MindScope AI journey
            </p>
          </div>

          {/* Form */}
          <div className="mt-10 space-y-5">
            {/* Email Field */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300/40 group-focus-within:text-violet-400 transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/5 bg-white/5 pl-12 pr-4 py-3.5 text-white placeholder-indigo-200/30 outline-none transition-all focus:border-violet-500/30 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300/40 group-focus-within:text-violet-400 transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    register();
                  }
                }}
                className="w-full rounded-2xl border border-white/5 bg-white/5 pl-12 pr-4 py-3.5 text-white placeholder-indigo-200/30 outline-none transition-all focus:border-violet-500/30 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 animate-message">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Buttons */}
            <button
              onClick={register}
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3.5 font-semibold text-white shadow-lg hover:shadow-violet-600/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <UserPlus className="h-5 w-5" />
              <span>{loading ? "Creating Account..." : "Create Account"}</span>
            </button>

            <button
              onClick={() => router.push("/login")}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/5 px-4 py-3.5 font-semibold text-indigo-200/70 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all active:scale-[0.98] cursor-pointer"
            >
              <LogIn className="h-5 w-5" />
              <span>Already have an account? Login</span>
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-10 border-t border-white/5 pt-6 text-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400/70">
              MindScope AI
            </h3>
            <p className="mt-1 text-xs text-indigo-200/40">
              Understand yourself better. One conversation at a time.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}