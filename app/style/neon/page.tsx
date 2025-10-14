"use client";
import NeonCard from "@/components/NeonCard";
import { NeonBar } from "@/components/NeonBar";
import { RadialGauge } from "@/components/RadialGauge";

export default function NeonDemo(){
  return (
    <main className="mx-auto max-w-6xl p-6 md:p-8 space-y-8">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-x-0 -top-full h-full bg-gradient-to-b from-transparent via-white/6 to-transparent animate-scan" />
      </div>

      <div className="flex flex-wrap gap-3">
        <NeonCard><div className="text-xs opacity-80">LEVEL 7 · <span className="text-cyan">THE NETRUNNER</span></div>
          <div className="mt-1 text-2xl font-extrabold drop-shadow-neon">BRAIN HEIST</div></NeonCard>
        <NeonCard accent="lime"><div className="text-xs opacity-80">CREDITS</div>
          <div className="mt-1 text-2xl font-extrabold">1,250</div></NeonCard>
        <NeonCard accent="mag"><div className="text-xs opacity-80">XP</div>
          <div className="mt-1 text-2xl font-extrabold">3,500 / 5,000</div></NeonCard>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        <NeonCard>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="h-56 grid place-items-center">
              <div className="size-40 rounded-full bg-gradient-to-br from-cyan/30 to-mag/20 animate-float shadow-glowCyan" />
            </div>
            <div>
              <div className="text-lg font-bold mb-2">HACKING SKILLS</div>
              <div className="space-y-3">
                {[80,45,60,35].map((v,i)=>(
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1"><span className="opacity-90">Skill {i+1}</span><span className="opacity-70">{v}%</span></div>
                    <NeonBar value={v}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </NeonCard>

        <div className="space-y-6 md:col-span-1">
          <NeonCard title="SECURITY LEVEL" accent="cyan">
            <div className="grid place-items-center py-1"><RadialGauge value={67}/></div>
            <div className="mt-3 text-sm space-y-1">
              <div>FIREWALL PROTOCOL: <span className="text-cyan font-semibold">ACTIVE</span></div>
              <div>ENCRYPTION: <span className="text-mag font-semibold">MAX</span></div>
              <div>DECOY ROUTINE: <span className="text-lime font-semibold">ONLINE</span></div>
            </div>
          </NeonCard>
        </div>
      </div>
    </main>
  );
}