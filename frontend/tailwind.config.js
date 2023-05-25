/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        color1: '#e5eee7',
        color2: '#317372',
        color3: '#4a8482',
        color4: '#649693',
        color5: '#7ea7a4',
        color6: '#e5eee7',
      },
    },
    fontFamily: {
      Raleway: ['Raleway, sans-serif'],
    },
  },
  plugins: [],
};
