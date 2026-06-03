"use client";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="mb-6 text-7xl animate-pulse">
          🧠
        </div>

        <h1 className="text-4xl font-bold text-white">
          MindScope AI
        </h1>

        <p className="mt-3 text-gray-400">
          Reflect • Understand • Grow
        </p>

        <div className="mt-6 flex justify-center">
          <div className="h-2 w-48 overflow-hidden rounded-full bg-gray-700">
            <div className="h-full w-full animate-pulse bg-violet-500" />
          </div>
        </div>
      </div>
    </div>
  );
}