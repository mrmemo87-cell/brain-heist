"use client";
import React, {useEffect, useRef, useState} from "react";

export default function AudioController(){
  const ref = useRef<HTMLAudioElement>(null);
  const [on, setOn] = useState<boolean>(() => localStorage.getItem("music") === "on");
  useEffect(()=>{ const a = ref.current; if (!a) return;
    if(on){ a.volume=.25; a.loop=true; a.play().catch(()=>{}); } else { a.pause(); }
    localStorage.setItem("music", on?"on":"off");
  },[on]);
  return (
    <div className="text-xs opacity-80 flex items-center gap-2">
      <button className="px-2 py-1 rounded bg-[rgba(255,255,255,.08)] hover:bg-[rgba(255,255,255,.12)]"
              onClick={()=>setOn(v=>!v)}>
        {on?"🔊 Music: On":"🔇 Music: Off"}
      </button>
      <audio ref={ref} src="/music/bg.mp3" preload="auto"/>
    </div>
  );
}