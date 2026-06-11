/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#fdf2f2',
          100: '#fce2e2',
          200: '#f9c9c9',
          300: '#f4a5a5',
          400: '#eb7373',
          500: '#de4747',
          600: '#c92a2a',
          700: '#a82121',
          800: '#8B2323',
          900: '#741f1f',
          950: '#3f0d0d',
        },
        stone: {
          50: '#fafaf9',
          100: '#f5f0e6',
          200: '#e7e0d5',
          300: '#d4cbb8',
          400: '#b9ab91',
          500: '#a08e72',
          600: '#917a5f',
          700: '#796450',
          800: '#655446',
          900: '#54473c',
          950: '#2e241f',
        },
        teal: {
          50: '#f0f7f9',
          100: '#d9ecef',
          200: '#b7d9df',
          300: '#89bcc6',
          400: '#5498a6',
          500: '#397b8a',
          600: '#1F4E5F',
          700: '#1a414f',
          800: '#173743',
          900: '#162f39',
          950: '#081419',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'elegant': '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
