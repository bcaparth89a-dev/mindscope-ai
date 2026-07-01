"use client";

import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          const delayTimer = setTimeout(() => {
            onComplete();
          }, 450);
          return 100;
        }
        // Simulates dynamic loading increments
        const increment = Math.floor(Math.random() * 12) + 6;
        return Math.min(prev + increment, 100);
      });
    }, 180);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07050a] select-none text-white">
      {/* Moving background lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Animated logo wrapper */}
        <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
          {/* Inner ring */}
          <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-spin" style={{ animationDuration: "8s" }} />
          {/* Outer ring with glow */}
          <div className="absolute -inset-2 rounded-full border border-dashed border-indigo-500/10 animate-spin" style={{ animationDuration: "16s", animationDirection: "reverse" }} />
          {/* Glowing aura */}
          <div className="absolute inset-3 rounded-full bg-violet-500/10 blur-xl animate-pulse" />
          
          <span className="relative text-6xl drop-shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:scale-110 transition-transform duration-300 cursor-default">
            🧠
          </span>
        </div>

        {/* Brand details */}
        <h1 className="text-4xl font-extrabold tracking-tight font-display bg-gradient-to-r from-violet-200 via-white to-indigo-200 bg-clip-text text-transparent">
          MindScope AI
        </h1>

        <p className="mt-3 text-sm font-medium text-indigo-200/50 uppercase tracking-widest">
          Reflect • Understand • Grow
        </p>

        {/* Dynamic progress bar */}
        <div className="mt-10 w-64">
          <div className="flex items-center justify-between text-xs text-indigo-300/40 mb-2 font-medium">
            <span>INITIALIZING ENGINE</span>
            <span className="font-mono text-violet-400 font-bold">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/5 shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 shadow-[0_0_8px_rgba(139,92,246,0.5)] transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Skip action button */}
        <button
          onClick={onComplete}
          className="mt-12 text-xs font-semibold tracking-wider text-white/30 hover:text-white/80 transition-colors uppercase border border-white/10 hover:border-white/20 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-sm shadow-sm cursor-pointer"
        >
          Skip Intro
        </button>
      </div>
    </div>
  );
}