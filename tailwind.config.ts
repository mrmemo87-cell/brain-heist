import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#ff2d91',
          cyan: '#00d0e8',
          ink: '#0b0f14',
          panel: '#0e131a',
          line: '#1a2230',
        },
      },
      boxShadow: {
        glow: '0 0 8px rgba(0,208,232,0.7), 0 0 16px rgba(255,45,145,0.5)',
        'glow-soft': '0 0 6px rgba(0,208,232,0.35)',
      },
      keyframes: {
        'pulse-glow': {
          '0%,100%': { boxShadow: '0 0 10px rgba(0,208,232,0.6)' },
          '50%': { boxShadow: '0 0 16px rgba(255,45,145,0.7)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
      },
      borderRadius: { '2xl': '1.25rem' },
    },
  },
  plugins: [],
};
export default config;