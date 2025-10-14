"use client";
import React from "react";
import NeonCard from "@/components/NeonCard";
import { supabase } from "@/lib/supa";

export default function LoginPage(){
  async function demo(){
    // TODO: your real sign-in method
    const email = prompt("Enter demo email (existing user)","");
    if(!email) return;
    await supabase.auth.signInWithOtp({ email });
    alert("Check your email for a magic link.");
  }
  return (
    <div className="grid place-items-center min-h-[60vh]">
      <div className="max-w-md w-full">
        <NeonCard title="Welcome back" subtitle="Access Brain Heist" accent="cyan">
          <p className="opacity-80">Log in to continue. New look. Neon vibes. 🔐</p>
          <button onClick={demo}
            className="mt-4 px-4 py-2 rounded font-semibold bg-[rgba(255,255,255,.08)] hover:bg-[rgba(255,255,255,.12)]">
            Continue with email
          </button>
        </NeonCard>
      </div>
    </div>
  );
}