/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:     '#0B0B0F',
        accent:      '#FF4D2E',
        'accent-dark':'#E03520',
        surface:     '#FFFFFF',
        'surface-alt':'#F5F5F5',
        border:      '#E8E8E8',
        'text-primary':'#0B0B0F',
        'text-muted': '#6B7280',
        success:     '#16A34A',
        warning:     '#D97706',
        danger:      '#DC2626',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Clash Display"', 'Inter', 'sans-serif'],
      },
      screens: {
        xs: '480px',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'fade-in':        'fadeIn 0.2s ease-out',
        'ticker':         'ticker 12s linear infinite',
      },
      keyframes: {
        slideInRight: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        ticker: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
};
