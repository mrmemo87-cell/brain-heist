import { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonPink: "var(--neon-pink)",
        neonCyan: "var(--neon-cyan)",
        panelBg: "var(--panel)",
        appBg: "var(--bg)",
      },
      borderRadius: {
        "xl-2": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
