// postcss.config.cjs
module.exports = {
  plugins: {
    // Tailwind v4 requires the dedicated PostCSS wrapper package
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
