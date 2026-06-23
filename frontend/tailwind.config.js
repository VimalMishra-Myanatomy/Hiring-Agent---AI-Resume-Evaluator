/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        hr: {
          green: '#21C45D',
          'green-bright': '#2EE06A',
          'green-dim': '#1A9F4A',
          teal: '#2DD4BF',
          bg: '#080B10',
          surface: '#0E1218',
          card: '#141A22',
          'card-hover': '#1A222C',
          border: '#2A3344',
          'border-light': '#3D4A5C',
          muted: '#7D8B9E',
          text: '#E8EDF4',
          danger: '#F47067',
          warning: '#E3B341',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        glow: '0 0 48px rgba(33, 196, 93, 0.12)',
        'glow-sm': '0 0 20px rgba(33, 196, 93, 0.08)',
        card: '0 4px 32px rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
