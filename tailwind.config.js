/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm, caring palette - terracotta meets sage
        brand: {
          50: '#fef7f4',
          100: '#fdeee8',
          200: '#fad9cc',
          300: '#f5b89e',
          400: '#ed8e6a',
          500: '#e36b42',
          600: '#d4522a',
          700: '#b04022',
          800: '#8f3621',
          900: '#752f1f',
          950: '#3f150d',
        },
        sage: {
          50: '#f6f7f4',
          100: '#e9ebe3',
          200: '#d4d8c8',
          300: '#b7bea5',
          400: '#9aa283',
          500: '#7d8766',
          600: '#626b50',
          700: '#4d5440',
          800: '#404536',
          900: '#373b30',
          950: '#1c1e18',
        },
        cream: {
          50: '#fefdfb',
          100: '#fcf9f3',
          200: '#f8f2e6',
          300: '#f2e7d3',
          400: '#e9d5b5',
          500: '#dfc198',
        },
        slate: {
          850: '#1a2332',
          925: '#0f1520',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'inner-soft': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.03)',
        'elevated': '0 4px 20px -2px rgb(0 0 0 / 0.1), 0 2px 8px -2px rgb(0 0 0 / 0.06)',
        'card': '0 1px 3px rgb(0 0 0 / 0.06), 0 1px 2px rgb(0 0 0 / 0.04)',
      },
    },
  },
  plugins: [],
};
