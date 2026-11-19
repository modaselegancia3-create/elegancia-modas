/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B1A18',
        muted: '#5E574C',
        line: '#E6E1D9',
        cream: '#F4EFE7',
        gold: '#8A6A2F',
        goldl: '#D4B377',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Jost', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
