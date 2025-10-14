"use client";
import React from "react";

export default function AudioController(){
  const [playing,setPlaying] = React.useState(false);
  const ref = React.useRef<HTMLAudioElement>(null);

  React.useEffect(()=>{ // try resume if user navigates back
    ref.current?.pause();
    setPlaying(false);
  },[]);

  async function toggle(){
    try{
      if(!ref.current) return;
      if(playing){ ref.current.pause(); setPlaying(false); }
      else { await ref.current.play(); setPlaying(true); }
    }catch{ /* ignore */ }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <audio ref={ref} src="/sounds/bg.mp3" loop />
      <button
        onClick={toggle}
        className="px-3 py-1 rounded-full text-xs font-semibold
                   bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur
                   shadow-[0_0_18px_rgba(0,255,255,.25)]">
        {playing ? "🔊 Music: On" : "🔇 Music: Off"}
      </button>
    </div>
  );
}