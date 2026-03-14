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
            colors: {
                // Core Mentorium palette
                'm-primary':     designTokens.colors.primary,
                'm-primaryMed':  designTokens.colors.primaryMed,
                'm-secondary':   designTokens.colors.secondary,
                'm-gold':        designTokens.colors.gold,
                'm-cream':       designTokens.colors.cream,
                'm-accent':      designTokens.colors.accent,
                'm-dark':        designTokens.colors.dark,
                'm-darkCard':    designTokens.colors.darkCard,
                'm-creamLight':  designTokens.colors.creamLight,
                'm-error':       designTokens.colors.error,
                'm-errorSoft':   designTokens.colors.errorSoft,

                // Legacy compat
                ...designTokens.colors,
            },
            fontFamily: {
                serif: [designTokens.fonts.serif],
                sans:  [designTokens.fonts.sans],
            },
            spacing: {
                'tok-xs':  `${designTokens.spacing.xs}px`,
                'tok-sm':  `${designTokens.spacing.sm}px`,
                'tok-md':  `${designTokens.spacing.md}px`,
                'tok-lg':  `${designTokens.spacing.lg}px`,
                'tok-xl':  `${designTokens.spacing.xl}px`,
            },
            borderRadius: {
                'tok-sm':  `${designTokens.borderRadius.sm}px`,
                'tok-md':  `${designTokens.borderRadius.md}px`,
                'tok-lg':  `${designTokens.borderRadius.lg}px`,
                'tok-xl':  `${designTokens.borderRadius.xl}px`,
            },
        },
    },
    plugins: [],
}