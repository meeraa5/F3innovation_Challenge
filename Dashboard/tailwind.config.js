/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",   // <-- required for Vite + React/TS
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

