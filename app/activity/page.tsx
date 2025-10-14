"use client";
import React, {useEffect, useState} from "react";
import NeonCard from "@/components/NeonCard";
import { supabase } from "@/lib/supa";

type Target = { uid:string; name:string; last_online_at:string | null };

export default function ActivityPage(){
  const [items,setItems]=useState<Target[]>([]);
  useEffect(()=>{ (async()=>{
    // simple public list by batch; replace with your RPC if you have it
    const { data } = await supabase.from("users")
      .select("uid, last_online_at")
      .limit(50);
    const rows = (data??[]).map((r:any)=>({
      uid:r.uid, name:(r.uid??"player").slice(0,4), last_online_at:r.last_online_at
    }));
    setItems(rows as Target[]);
  })(); },[]);
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-extrabold emoji">⚡ Activity</h1>
      <NeonCard title="Targets (your batch)" accent="purple">
        <ul className="space-y-3">
          {items.map((t)=>(
            <li key={t.uid} className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs opacity-70">
                  Online: {t.last_online_at ? new Date(t.last_online_at).toLocaleString() : "unknown"}
                </div>
              </div>
              <button className="px-3 py-1 rounded bg-[rgba(255,255,255,.08)] hover:bg-[rgba(255,255,255,.12)]">
                🗡️ Hack
              </button>
            </li>
          ))}
        </ul>
      </NeonCard>
    </div>
  );
}