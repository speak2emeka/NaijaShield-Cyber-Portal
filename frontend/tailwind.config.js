/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        shield: {
          navy: '#081120',
          deep: '#050c17',
          green: '#006B3C',
          glow: '#00ff99'
        }
      },
      boxShadow: {
        glow: '0 0 35px rgba(0, 255, 153, 0.18)',
        'glow-lg': '0 0 50px rgba(0, 255, 153, 0.25)',
        'glow-sm': '0 0 20px rgba(0, 255, 153, 0.1)'
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'draw-line': 'drawLine 1.2s ease forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        drawLine: {
          '0%': { strokeDashoffset: '400' },
          '100%': { strokeDashoffset: '0' }
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(0, 255, 153, 0.16)' },
          '50%': { boxShadow: '0 0 45px rgba(0, 255, 153, 0.28)' }
        }
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)'
      }
    }
  },
  plugins: []
};
