/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030712',
          900: '#050b1a',
          850: '#081126',
          800: '#0c1a36',
          700: '#142952',
          600: '#1e3d7b',
        },
        lunar: {
          cyan: '#00f5d4',
          blue: '#00d2ff',
          neon: '#38bdf8',
          purple: '#a855f7',
          gold: '#f59e0b',
          amber: '#fbbf24',
          danger: '#ef4444',
          warning: '#f97316',
          success: '#10b981',
          surface: '#94a3b8',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 245, 212, 0.4)',
        'glow-blue': '0 0 25px -5px rgba(0, 210, 255, 0.4)',
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.4)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'hud': '0 8px 32px 0 rgba(0, 10, 30, 0.7)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
