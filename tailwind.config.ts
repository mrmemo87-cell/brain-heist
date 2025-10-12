import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50:  '#f7f7fb',
          100: '#ececf3',
          200: '#d8d9e7',
          300: '#b4b7d2',
          400: '#8288b2',
          500: '#5e6493',
          600: '#464b73',
          700: '#373b5c',
          800: '#262943',
          900: '#191c2f',
          950:'#0e101c'
        },
        primary: {
          DEFAULT: '#10b981', // emerald-500
          600: '#059669',
          700: '#047857'
        }
      },
      boxShadow: {
        soft: '0 6px 20px rgba(0,0,0,0.25)',
      },
      borderRadius: {
        '2xl': '1.25rem'
      }
    },
  },
  plugins: [],
};
export default config;

