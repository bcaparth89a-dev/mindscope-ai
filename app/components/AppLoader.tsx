"use client";

import { useState } from "react";
import SplashScreen from "./SplashScreen";

type Props = {
  children: React.ReactNode;
};

export default function AppLoader({ children }: Props) {
  const [loading, setLoading] = useState(true);

  return loading ? (
    <SplashScreen onComplete={() => setLoading(false)} />
  ) : (
    <>{children}</>
  );
}