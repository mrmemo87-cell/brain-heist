'use client';
export default function PlayerAvatar({ src, size=64 }:{ src?: string|null; size?: number }) {
  return (
    <div
      className="rounded-2xl overflow-hidden bg-ink-800 ring-2 ring-white/10"
      style={{ width: size, height: size }}
      title="Player avatar"
    >
      {src
        ? <img src={src} alt="avatar" className="w-full h-full object-cover" />
        : <div className="w-full h-full grid place-items-center text-3xl">рџЉ</div>}
    </div>
  );
}

