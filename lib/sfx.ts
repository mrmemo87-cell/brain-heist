'use client';

const cache = new Map<string, HTMLAudioElement>();
function sound(src: string) {
  if (!cache.has(src)) cache.set(src, new Audio(src));
  const a = cache.get(src)!;
  a.currentTime = 0;
  return a;
}

export const SFX = {
  click: () => sound('/sfx/click.mp3').play(),
  buy: () => sound('/sfx/buy.mp3').play(),
  activate: () => sound('/sfx/activate.mp3').play(),
  correct: () => sound('/sfx/correct.mp3').play(),
  wrong: () => sound('/sfx/wrong.mp3').play(),
  claim: () => sound('/sfx/claim.mp3').play(),
  hack: () => sound('/sfx/hack.mp3').play(),
};

export function useMusic() {
  let a: HTMLAudioElement | null = null;
  return {
    start: (vol=0.4) => {
      if (!a) { a = new Audio('/music/bg.mp3'); a.loop = true; }
      a.volume = vol; a.play();
    },
    setVol: (vol:number)=>{ if(a){ a.volume = vol; } },
    stop: ()=>{ a?.pause(); },
  };
}
