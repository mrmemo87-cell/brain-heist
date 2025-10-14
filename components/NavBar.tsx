"use client";
import Link from "next/link";
import React, {useEffect, useState} from "react";
import { supabase } from "@/lib/supa";
import AudioController from "./AudioController";

export default function NavBar(){
  const [authed,setAuthed]=useState<boolean>(false);
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=> setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s)=> setAuthed(!!s));
    return () => { sub.subscription.unsubscribe(); };
  },[]);
  const to = (p:string)=> authed ? p : "/login";
  return (
    <div className="bh-shell flex items-center justify-between py-3">
      <div className="bh-logo emoji">🧠 Brain Heist</div>
      <nav className="bh-nav">
        <Link href={to("/")}>Home</Link>
        <Link href={to("/activity")}>Activity</Link>
        <Link href={to("/leaderboard")}>Leaderboard</Link>
        <Link href={to("/tasks")}>Tasks</Link>
        <Link href={to("/shop")}>Shop</Link>
        <Link href={to("/inventory")}>Inventory</Link>
        <Link href={to("/profile")}>Profile</Link>
      </nav>
      <AudioController/>
    </div>
  );
}