/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { ink: '#202722', moss: '#496653', cream: '#f5f1ea', clay: '#c97d60', mist: '#e5ebe5' },
      fontFamily: { display: ['"DM Serif Display"', 'serif'], sans: ['"Manrope"', 'sans-serif'] },
      boxShadow: { soft: '0 18px 50px rgba(32, 39, 34, .08)' }
    }
  },
  plugins: []
};