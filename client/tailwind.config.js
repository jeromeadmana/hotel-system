/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 2025 Elegant Hotel Design System
        primary: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#adb5bd',
          400: '#6c757d',
          500: '#495057',
          600: '#343a40',
          700: '#212529',
          800: '#1a1d21',
          900: '#0d0f12',
          DEFAULT: '#212529', // Deep charcoal
          dark: '#0d0f12',
        },
        secondary: {
          50: '#faf8f5',
          100: '#f5f1e8',
          200: '#ebe4d4',
          300: '#ddd2b8',
          400: '#c9b895',
          500: '#b5a07b',
          600: '#9d8760',
          700: '#7d6b4d',
          DEFAULT: '#ebe4d4', // Warm beige/ivory
          light: '#faf8f5',
          dark: '#7d6b4d',
        },
        accent: {
          50: '#fef9ec',
          100: '#fdf2d4',
          200: '#fbe5a8',
          300: '#f7d171',
          400: '#f2bc40',
          500: '#d4a030',
          600: '#b8841f',
          700: '#94661a',
          DEFAULT: '#d4a030', // Muted gold/bronze
          light: '#f2bc40',
          dark: '#94661a',
        },
        teal: {
          50: '#f0f9f7',
          100: '#d9f0eb',
          200: '#b3e0d7',
          300: '#7fcabd',
          400: '#4dada0',
          500: '#338f85',
          600: '#27726a',
          DEFAULT: '#338f85', // Muted teal
        },
        // Neutral backgrounds
        background: {
          DEFAULT: '#faf8f5', // Soft off-white
          paper: '#ffffff',
          gray: '#f5f1e8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Playfair Display', 'Georgia', 'serif'], // Elegant serif for headings
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // 2025 Typography Scale (larger, more breathable)
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.6' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
      },
      spacing: {
        // 8px rhythm
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        // Soft, elegant shadows only
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        DEFAULT: '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 24px 0 rgba(0, 0, 0, 0.10)',
        'xl': '0 12px 32px 0 rgba(0, 0, 0, 0.12)',
        'elegant': '0 4px 20px 0 rgba(33, 37, 41, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
