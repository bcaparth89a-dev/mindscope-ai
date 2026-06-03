"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      router.replace("/");
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      setError("");

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        setError(error.message);
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      console.error(err);

      setError(
        "Failed to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-purple-500/10" />

      <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl animate-pulse" />

      {/* Card */}
      <div className="relative w-full max-w-md">

        <div className="rounded-3xl border bg-background/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">

          {/* Logo */}
          <div className="text-center">

            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border bg-primary/5 shadow-lg">
              <span className="text-5xl">
                🧠
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Login to continue your conversations
            </p>

          </div>

          {/* Form */}
          <div className="mt-8 space-y-4">

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="
                w-full
                rounded-2xl
                border
                bg-background
                px-4
                py-3
                outline-none
                transition-all
                focus:ring-2
                focus:ring-primary
              "
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  login();
                }
              }}
              className="
                w-full
                rounded-2xl
                border
                bg-background
                px-4
                py-3
                outline-none
                transition-all
                focus:ring-2
                focus:ring-primary
              "
            />

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <button
              onClick={login}
              disabled={loading}
              className="
                w-full
                rounded-2xl
                bg-primary
                px-4
                py-3
                font-medium
                text-primary-foreground
                transition-all
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

            <button
              onClick={() =>
                router.push("/register")
              }
              className="
                w-full
                rounded-2xl
                border
                px-4
                py-3
                font-medium
                transition-all
                hover:bg-muted
              "
            >
              Create Account
            </button>

          </div>

          {/* Footer */}
          <div className="mt-8 border-t pt-6 text-center">

            <p className="text-sm text-muted-foreground">
              MindScope AI
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Understand yourself better. One conversation at a time.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}