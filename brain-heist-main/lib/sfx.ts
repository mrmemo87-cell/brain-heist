'use client';

const cache = new Map<string, HTMLAudioElement>();

function playOneShot(src: string, vol = 0.5) {
  try {
    const a = new Audio(src);
    a.volume = vol;
    a.play().catch(() => {});
  } catch {}
}

// ---------- Background (singleton) ----------
let bgEl: HTMLAudioElement | null = null;
let bgSrc = '/sounds/music/bg.mp3'; // default
let unlocked = false;

function ensureBgEl() {
  if (!bgEl) {
    bgEl = new Audio(bgSrc);
    bgEl.loop = true;
    bgEl.volume = 0.25;
  }
  return bgEl;
}

function startBg() {
  const a = ensureBgEl();
  // If already playing the same source, do nothing
  if (!a.paused) return;
  a.play().catch(() => {});
}

function stopBg() {
  bgEl?.pause();
}

function isBgPlaying() {
  return !!bgEl && !bgEl.paused;
}

export const SFX = {
  unlock() {
    // some browsers need a user gesture to allow audio
    // "warm up" by creating a silent AudioContext-style interaction
    unlocked = true;
  },

  // one-shots
  claim() { playOneShot('/sounds/collect.mp3'); },
  buy() { playOneShot('/sounds/buy.mp3'); },
  activate() { playOneShot('/sounds/activate.mp3'); },
  hackWin() { playOneShot('/sounds/hack_win.mp3'); },
  hackFail() { playOneShot('/sounds/hack_fail.mp3'); },
  correct() { playOneShot('/sounds/correct.mp3'); },
  wrong() { playOneShot('/sounds/wrong.mp3'); },
  levelUp() { playOneShot('/sounds/level_up.mp3'); },

  // background
  bg(loopKey?: string) {
    if (loopKey) bgSrc = `/sounds/music/bg.mp3`; // we only have one bg; ignore keys safely
    if (!unlocked) this.unlock();

    // reuse same element; update src only if it changed
    if (!bgEl) {
      ensureBgEl();
    } else if (!bgEl.src.endsWith(bgSrc)) {
      const wasPlaying = !bgEl.paused;
      bgEl.pause();
      bgEl.src = bgSrc;
      bgEl.loop = true;
      bgEl.volume = 0.25;
      if (wasPlaying) bgEl.play().catch(() => {});
    }

    startBg();
  },

  stopBg() { stopBg(); },
  isBgPlaying() { return isBgPlaying(); },
};
