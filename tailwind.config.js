/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#050816',
          secondary: '#081426',
        },
        surface: {
          DEFAULT: '#0D1B2A',
          glass: 'rgba(13, 27, 42, 0.75)',
          border: 'rgba(0, 194, 255, 0.2)',
        },
        accent: {
          cyan: '#00C2FF',
          blue: '#2563EB',
          ice: '#7DD3FC',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          critical: '#FF3B4E',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 194, 255, 0.4)',
        'glow-cyan-lg': '0 0 50px -10px rgba(0, 194, 255, 0.6)',
        'glow-blue': '0 0 30px -5px rgba(37, 99, 235, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 2.5s linear infinite',
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
