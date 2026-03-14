/**
 * Mentorium Design Tokens
 * Single source of truth for colors, themes, typography, spacing, and borders.
 * Used by both mentorium-app (React Native) and mentorium-web (Tailwind CSS).
 */

const colors = {
    // Core palette
    primary:     "#10443E",  // deep teal
    primaryMed:  "#32745C",  // medium teal
    secondary:   "#62A29A",  // mint
    gold:        "#B29361",  // warm gold
    cream:       "#EDE4D6",  // warm cream
    accent:      "#00FF9D",  // neon mint accent

    // Neutrals
    dark:        "#0f1413",
    darkCard:    "#152420",
    creamLight:  "#F5F0E8",

    // Semantic
    success:     "#62A29A",
    error:       "#EF4444",
    errorSoft:   "#BF6382",
    warning:     "#B29361",
};

const themes = {
    dark: {
        background:     "#0f1413",
        card:           "#152420",
        primaryAccent:  "#62A29A",
        secondaryAccent:"#32745C",
        textPrimary:    "#EDE4D6",
        textSecondary:  "#B29361",
        border:         "#10443E",
        success:        "#62A29A",
        error:          "#EF4444",
    },
    light: {
        background:     "#EDE4D6",
        card:           "#F5F0E8",
        primaryAccent:  "#10443E",
        secondaryAccent:"#32745C",
        textPrimary:    "#10443E",
        textSecondary:  "#32745C",
        border:         "#62A29A",
        success:        "#32745C",
        error:          "#BF6382",
    },
};

const fonts = {
    serif: "Georgia, 'Times New Roman', serif",
    sans:  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const spacing = {
    xs:  4,
    sm:  8,
    md:  16,
    lg:  24,
    xl:  32,
    xxl: 48,
};

const borderRadius = {
    sm:   4,
    md:   8,
    lg:   12,
    xl:   16,
    full: 9999,
};

module.exports = { colors, themes, fonts, spacing, borderRadius };
