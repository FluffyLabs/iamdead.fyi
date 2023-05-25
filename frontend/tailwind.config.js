/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#317372',
        secondary: '#649693',
        color0: '#4a8482',
        color1: '#e5eee7',
        color2: '#7ea7a4',
        color3: '#e5eee7',
      },
    },
    fontFamily: {
      Raleway: ['Raleway, sans-serif'],
    },
  },
  plugins: [],
};
