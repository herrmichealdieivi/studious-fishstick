const designTokens = require('../packages/design-tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./public/**/*.html",
        "./src/**/*.{js,jsx,ts,tsx}",
        "./*.html"
    ],
    theme: {
        extend: {
            colors: designTokens.colors,
            fontFamily: {
                serif: [designTokens.fonts.serif],
                sans: [designTokens.fonts.sans],
            },
            spacing: designTokens.spacing,
        },
    },
    plugins: [],
}