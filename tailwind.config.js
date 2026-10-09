/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pulse: {
          emerald: '#10b981',
          amber: '#f59e0b',
          crimson: '#ef4444',
          slate: '#0f172a',
        },
      },
    },
  },
  plugins: [],
};
