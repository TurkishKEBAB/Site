/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#edfcff',
          100: '#d6f7ff',
          200: '#b5f1ff',
          300: '#83e8ff',
          400: '#00d4ff',
          500: '#00bce0',
          600: '#0099cc',
          700: '#007aa3',
          800: '#006185',
          900: '#004d6b',
          950: '#003347',
        },
        dark: {
          50: '#e8e8f0',
          100: '#d0d0e0',
          200: '#9898b8',
          300: '#8888a8',
          400: '#5a5a80',
          500: '#3a3a60',
          600: '#1e1e3e',
          700: '#1a1a35',
          800: '#12122a',
          900: '#0a0a14',
          950: '#06060e',
        },
        amber: {
          400: '#f0b400',
          500: '#d4a000',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'blink': 'blink 1.2s step-end infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      backgroundImage: {
        'dot-grid-dark': 'radial-gradient(circle at 1px 1px, rgba(0,212,255,0.06) 1px, transparent 0)',
        'dot-grid-light': 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)',
        'glow-radial': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,212,255,0.12) 0%, transparent 55%)',
        'glow-radial-light': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,150,200,0.06) 0%, transparent 55%)',
      },
      backgroundSize: {
        'grid-32': '32px 32px',
      },
    },
  },
  plugins: [],
}
