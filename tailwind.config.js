// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // 💥 FIX: Explicitly include the root layout and page files
    './app/*.{js,ts,jsx,tsx}', // Catches ./app/page.tsx and ./app/layout.tsx
    
    // Continue scanning all sub-directories
    './app/**/*.{js,ts,jsx,tsx}', 
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}