/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'veto-blue-gray': '#E6E9F2',
        'veto-light-blue': '#DEE5F3',
        'veto-yellow': '#FFD500',
        'veto-black': '#111111',
        'veto-gray': '#6B7280',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      }
    },
  },
  plugins: [],
}
