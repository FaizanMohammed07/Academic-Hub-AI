/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // VJIT IT Brand Colors
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          DEFAULT: '#f59e0b',
          light:   '#fef3c7',
          dark:    '#d97706',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark:    '#0f0f11',
          muted:   '#f8fafc',
          'muted-dark': '#18181b',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft':  '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'card':  '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        'glow':  '0 0 20px rgba(99,102,241,0.3)',
        'glow-amber': '0 0 20px rgba(245,158,11,0.3)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp:   { '0%': { transform: 'translateY(10px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        slideDown: { '0%': { transform: 'translateY(-10px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        'gradient-dark':  'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        'gradient-card':  'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'mesh':           'radial-gradient(at 40% 20%, hsla(237,80%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.2) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
};
