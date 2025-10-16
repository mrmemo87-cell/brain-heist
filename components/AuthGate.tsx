"use client";
import React, { PropsWithChildren, useEffect, useState } from "react";

/**
 * Lightweight AuthGate stub. Renders children after mount to avoid SSR/hydration issues.
 * Replace with real Supabase auth gating when ready.
 */
export default function AuthGate({ children }: PropsWithChildren<{}>) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div />;
  return <>{children}</>;
}
