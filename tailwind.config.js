/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Enhanced color palette with more depth
        primary: {
          50: '#e6f1ff',
          100: '#b3d7ff',
          200: '#80bdff',
          300: '#4da3ff',
          400: '#1a89ff',
          500: '#0070e0',
          600: '#0057b3',
          700: '#003d80',
          800: '#00244d',
          900: '#000b1a'
        },
        secondary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43'
        },
        dark: {
          50: '#2c3e50',
          100: '#34495e',
          200: '#2c3e50',
          300: '#263747',
          400: '#1e2933',
          500: '#16202a',
          600: '#0e161f',
          700: '#060b0f',
          800: '#000000',
          900: '#000000'
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(-45deg, var(--tw-colors-dark-600), var(--tw-colors-dark-700), var(--tw-colors-dark-600), rgba(59,130,246,0.1))',
        'gradient-radial': 'radial-gradient(circle at 30% 30%, var(--tw-colors-primary-400/20), transparent 70%)',
        'gradient-mesh': 'linear-gradient(135deg, var(--tw-colors-primary-400/10), var(--tw-colors-primary-500/20))',
        'gradient-elegant': 'linear-gradient(135deg, var(--tw-colors-primary-400/10), var(--tw-colors-primary-400/5))',
        'radial-gradient': 'radial-gradient(circle at center, rgba(255,255,255,0.1), transparent 70%)'
      },
      animation: {
        // Advanced animations
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'subtle-pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'elegant-bounce': 'bounce 2s ease-in-out infinite',
        'fog-movement': 'fog-movement 45s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 25s ease-in-out infinite'
      },
      keyframes: {
        // Custom keyframes for gradient animations
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' }
        },
        'gradient-y': {
          '0%, 100%': { 'background-position': '50% 0%' },
          '50%': { 'background-position': '50% 100%' }
        },
        'gradient-xy': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 100%' }
        },
        'fog-movement': {
          '0%, 100%': { 
            transform: 'translate(0, 0) rotate(0deg)',
            opacity: '0.3'
          },
          '25%': { 
            transform: 'translate(5%, 10%) rotate(10deg)',
            opacity: '0.4'
          },
          '50%': { 
            transform: 'translate(-5%, -10%) rotate(-10deg)',
            opacity: '0.5'
          },
          '75%': { 
            transform: 'translate(10%, -5%) rotate(5deg)',
            opacity: '0.4'
          },
        },
        'gradient-shift': {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
            opacity: '0.7'
          },
          '50%': { 
            backgroundPosition: '100% 50%',
            opacity: '0.9'
          }
        }
      },
      boxShadow: {
        // Enhanced shadow effects for depth
        'elegant': '0 10px 25px rgba(0, 0, 0, 0.1), 0 6px 10px rgba(0, 0, 0, 0.08)',
        'super-elegant': '0 15px 35px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1)',
        'inner-elegant': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'deep-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'color-shadow': '0 10px 25px rgba(59, 130, 246, 0.2)'
      },
      borderRadius: {
        // More sophisticated border radius
        'elegant': '0.75rem',
        'super-elegant': '1rem',
        'ultra-elegant': '1.5rem'
      },
      transitionProperty: {
        // Expanded transition properties
        'elegant': 'transform, opacity, background-color, box-shadow, color'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate')
  ],
};
