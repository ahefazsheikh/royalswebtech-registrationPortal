// tailwind.config.js (NEW FILE IN ROOT)

/** @type {import('tailwindcss').Config} */
module.exports = {
  // This content array is crucial for the remote build to find your classes
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // Include plugins needed for utilities found in package.json
    require('tailwindcss-animate'),
  ],
}