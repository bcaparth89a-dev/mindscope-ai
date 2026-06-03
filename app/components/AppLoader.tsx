"use client";

import { useEffect, useState } from "react";
import SplashScreen from "./SplashScreen";

type Props = {
  children: React.ReactNode;
};

export default function AppLoader({
  children,
}: Props) {
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}