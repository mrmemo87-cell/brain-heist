"use client";

import React from "react";

export default function RollingCoin({ className = "" }: { className?: string }) {
  return (
    <span className={"inline-flex items-center " + className}>
      <span className="relative inline-block w-5 h-5 mr-1">
        <span className="absolute inset-0 flex items-center justify-center text-lg leading-none animate-[spin_0.9s_linear_infinite] select-none">
          🪙
        </span>
      </span>
    </span>
  );
}