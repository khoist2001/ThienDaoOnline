/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        xianxia: {
          bg: '#0a0d14',
          card: '#121824',
          border: '#2a3447',
          gold: '#f3c669',
          'gold-light': '#ffe8a3',
          'gold-dark': '#b8860b',
          jade: '#2dd4bf',
          'jade-light': '#99f6e4',
          'jade-dark': '#0f766e',
          cinnabar: '#ef4444',
          'cinnabar-dark': '#991b1b',
          demon: '#7c3aed',
          'demon-dark': '#3b0764',
          ink: '#1e293b',
          parchment: '#fef3c7',
        }
      },
      fontFamily: {
        title: ['"Ma Shan Zheng"', '"Long Cang"', 'serif'],
        subheading: ['"ZCOOL XiaoWei"', '"Noto Serif SC"', 'serif'],
        body: ['"Noto Serif"', '"Source Han Serif VN"', 'serif'],
      },
      boxShadow: {
        'xianxia-gold': '0 0 20px rgba(243, 198, 105, 0.35)',
        'xianxia-jade': '0 0 20px rgba(45, 212, 191, 0.35)',
        'xianxia-cinnabar': '0 0 20px rgba(239, 68, 68, 0.35)',
        'xianxia-demon': '0 0 20px rgba(124, 58, 237, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: 0.6, filter: 'drop-shadow(0 0 15px rgba(243,198,105,0.4))' },
          '50%': { opacity: 1, filter: 'drop-shadow(0 0 25px rgba(243,198,105,0.8))' },
        }
      }
    },
  },
  plugins: [],
}
