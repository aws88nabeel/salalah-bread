/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f0',
          100: '#f9edd9',
          200: '#f2d7b0',
          300: '#e9bc7d',
          400: '#e09d4d',
          500: '#d4842a',
          600: '#c36b1f',
          700: '#a2521c',
          800: '#82411e',
          900: '#69371b',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
