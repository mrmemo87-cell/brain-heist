import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink:   "#0b1020",
        panel: "#151b2e",
        cyan:  "#00f0ff",
        mag:   "#ff00e6",
        lime:  "#aaff00",
        warn:  "#ffc400",
      },
      boxShadow: {
        glowCyan: "0 0 0 .5px rgba(0,240,255,.7), 0 0 14px rgba(0,240,255,.55), 0 0 32px rgba(0,240,255,.35)",
        glowMag:  "0 0 0 .5px rgba(255,0,230,.7), 0 0 14px rgba(255,0,230,.55), 0 0 32px rgba(255,0,230,.35)",
        glowLime: "0 0 0 .5px rgba(170,255,0,.7), 0 0 14px rgba(170,255,0,.55), 0 0 32px rgba(170,255,0,.35)",
      },
      dropShadow: { neon: ["0 0 8px rgba(0,240,255,.9)"] },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        glow:  { "0%,100%": { filter: "drop-shadow(0 0 4px #00f0ff)" }, "50%": { filter: "drop-shadow(0 0 10px #00f0ff)" } },
        scan:  { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(200%)" } },
      },
      animation: { float: "float 5s ease-in-out infinite", glow: "glow 2.6s ease-in-out infinite", scan: "scan 6s linear infinite" },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
} satisfies Config;