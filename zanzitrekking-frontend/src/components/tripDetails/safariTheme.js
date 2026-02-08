/**
 * Tanzania Safari & Trekking Design Theme
 * Sophisticated, modern, professional color palette and design tokens
 */

export const safariTheme = {
  colors: {
    // Primary Safari Colors - Earth tones
    primary: {
      50: "#faf8f5",
      100: "#f5f1ea",
      200: "#e8ddd0",
      300: "#d4c4a8",
      400: "#b89d7a",
      500: "#9d7a5a", // Main safari brown
      600: "#7d6148",
      700: "#5d4836",
      800: "#3e3024",
      900: "#1f1812",
    },
    // Secondary - Forest Green
    secondary: {
      50: "#f0f7f4",
      100: "#dcefe6",
      200: "#b8dfcd",
      300: "#8fc9ae",
      400: "#5fa88a",
      500: "#3d8b6f", // Safari green
      600: "#2f6f58",
      700: "#255645",
      800: "#1e4333",
      900: "#163626",
    },
    // Accent - Warm Amber (sunset/savanna)
    accent: {
      50: "#fffaf0",
      100: "#fff3d9",
      200: "#ffe5b3",
      300: "#ffd180",
      400: "#ffb84d",
      500: "#ff9f1a", // Safari sunset
      600: "#e68900",
      700: "#cc7700",
      800: "#b36500",
      900: "#995300",
    },
    // Neutral - Sophisticated grays
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
    },
  },
  
  // Category colors for pricing tiers
  categories: {
    standard: {
      bg: "bg-amber-50",
      bgStrong: "bg-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
      borderStrong: "border-amber-400",
      gradient: "from-amber-500 to-amber-600",
      iconBg: "bg-amber-500",
    },
    midRange: {
      bg: "bg-emerald-50",
      bgStrong: "bg-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-200",
      borderStrong: "border-emerald-400",
      gradient: "from-emerald-500 to-emerald-600",
      iconBg: "bg-emerald-500",
    },
    luxury: {
      bg: "bg-slate-50",
      bgStrong: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
      borderStrong: "border-slate-400",
      gradient: "from-slate-600 to-slate-700",
      iconBg: "bg-slate-600",
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      display: ["Playfair Display", "serif"],
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
  },
  
  // Shadows - Subtle and sophisticated
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  
  // Spacing
  spacing: {
    section: "py-12 lg:py-16",
    card: "p-6 lg:p-8",
  },
};

export default safariTheme;
