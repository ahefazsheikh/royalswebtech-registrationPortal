// postcss.config.mjs

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // 💥 FIX: Use the full package name as required by the error message
    '@tailwindcss/postcss': {}, 
    // Keep autoprefixer
    autoprefixer: {}, 
  },
}

export default config