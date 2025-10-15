// postcss.config.mjs (FIXED)

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // 💥 FIX 1: Change to the correct plugin name: 'tailwindcss'
    tailwindcss: {},
    // 💥 FIX 2: Add autoprefixer for better compatibility
    autoprefixer: {},
  },
}

export default config