"use client";
import React from "react";

export function UserLink({ uid, children }: { uid: string; children: React.ReactNode }) {
  return (
    <span data-user-uid={uid} className="cursor-pointer hover:underline decoration-wavy decoration-fuchsia-400">
      {children}
    </span>
  );
}
