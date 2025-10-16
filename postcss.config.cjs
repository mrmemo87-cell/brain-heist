// postcss.config.cjs
module.exports = {
  plugins: {
    // Tailwind v4 requires this wrapper plugin
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
