/** @type {import('tailwindcss').Config} */
import tailgrids from "tailgrids/plugin.js";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 🌿 Primary Palette - Tropical Forest Green (matching frontend)
        primary: {
          DEFAULT: "#1B4332", // Deep forest green
          50: "#f0f9f4",
          100: "#dcf2e3",
          200: "#bce5ca",
          300: "#8dd1a5",
          400: "#56b678",
          500: "#329854", // Mid forest green
          600: "#237d42", // Main forest green
          700: "#1B4332", // Deep forest green (from logo)
          800: "#163d2d",
          900: "#133429",
          950: "#0a1c16",
        },

        // 🔥 Secondary Palette - Vibrant Coral/Orange (matching frontend)
        secondary: {
          DEFAULT: "#E76F51", // Coral orange
          50: "#fef7f4",
          100: "#fdeee7",
          200: "#fad9c4",
          300: "#f6c09b",
          400: "#f19968",
          500: "#E76F51", // Main coral
          600: "#d85a3f",
          700: "#b64834",
          800: "#933d2f",
          900: "#77362b",
          950: "#401a14",
        },

        // 🌺 Accent Palette - Warm Red (matching frontend)
        accent: {
          DEFAULT: "#D62828", // Deep red
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#D62828", // Main red
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },

        // ☀️ Sunshine Palette - Golden Yellow (matching frontend)
        sunshine: {
          DEFAULT: "#F4A261", // Golden yellow
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#F4A261", // Main golden
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },

        // 🎯 Teal Palette (your preferred color)
        teal: {
          DEFAULT: "#14b8a6",
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },

        // 🌊 Emerald Palette (your preferred color)
        emerald: {
          DEFAULT: "#10b981",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },

        // 🌅 Semantic Colors
        success: {
          DEFAULT: "#10b981", // Emerald
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },

        warning: {
          DEFAULT: "#F4A261", // Sunshine golden
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#F4A261",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },

        error: {
          DEFAULT: "#D62828", // Hibiscus red
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#D62828",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },

        info: {
          DEFAULT: "#14b8a6", // Teal
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },

        // 🏔️ Neutral Palette
        neutral: {
          DEFAULT: "#ffffff",
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
          950: "#0c0a09",
        },

        // 📝 Text Colors
        text: {
          DEFAULT: "#1f2937",
          light: "#6b7280",
          lighter: "#9ca3af",
          lightest: "#d1d5db",
          dark: "#111827",
          inverse: "#ffffff",
          muted: "#64748b",
        },

        // 🏞️ Background Variations
        background: {
          DEFAULT: "#ffffff",
          paper: "#fafaf9",
          muted: "#f5f5f4",
          elevated: "#ffffff",
          nature: "#f0f9f4",
          sunset: "#fef7f4",
          dark: "#1c1917",
          "dark-elevated": "#292524",
        },

        // Legacy support (for backward compatibility)
        charcoal: "#333333",
        slateGray: "#708090",
        crimsonRed: "#dc143c",
        emeraldGreen: "#10b981",
        coolGray: "#d3d3d3",
        royalPurple: "#6a0dad",
        softGold: "#f5c518",
        coral: "#E76F51",
        deepBlue: "#14b8a6",
        "dark-blue": "#003366",
        "light-blue": "#0056b3",
      },

      // 🎨 Brand Gradients (matching frontend)
      backgroundImage: {
        "brand-primary": "linear-gradient(135deg, #1B4332 0%, #52734D 100%)",
        "brand-secondary": "linear-gradient(135deg, #E76F51 0%, #F4A261 100%)",
        "brand-accent": "linear-gradient(135deg, #D62828 0%, #E76F51 100%)",
        "teal-emerald": "linear-gradient(135deg, #14b8a6 0%, #10b981 100%)",
        "tropical-sunset":
          "linear-gradient(135deg, #F4A261 0%, #E76F51 30%, #D62828 100%)",
        "forest-depth":
          "linear-gradient(135deg, #52734D 0%, #1B4332 50%, #0F2419 100%)",
      },

      // 🌫️ Enhanced Shadows
      boxShadow: {
        soft: "0 2px 4px -1px rgba(45, 41, 38, 0.04), 0 4px 8px -2px rgba(45, 41, 38, 0.02)",
        medium:
          "0 6px 16px -4px rgba(45, 41, 38, 0.08), 0 4px 8px -4px rgba(45, 41, 38, 0.03)",
        large:
          "0 12px 32px -4px rgba(45, 41, 38, 0.08), 0 8px 16px -8px rgba(45, 41, 38, 0.04)",
        xl: "0 24px 48px -8px rgba(45, 41, 38, 0.12), 0 16px 32px -16px rgba(45, 41, 38, 0.06)",
        "nature-soft": "0 2px 8px rgba(27, 67, 50, 0.08)",
        "nature-medium": "0 8px 24px rgba(27, 67, 50, 0.12)",
        "nature-large": "0 16px 40px rgba(27, 67, 50, 0.16)",
        "teal-glow": "0 0 20px rgba(20, 184, 166, 0.4)",
        "emerald-glow": "0 0 20px rgba(16, 185, 129, 0.4)",
      },

      // ✨ Animations
      animation: {
        "fade-in": "fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        shimmer: "shimmer 2.5s linear infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(20, 184, 166, 0.3)" },
          "100%": { boxShadow: "0 0 30px rgba(20, 184, 166, 0.6)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },

      // 📏 Spacing
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
        144: "36rem",
      },

      // 🔵 Border Radius
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },

      // 📱 Breakpoints
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1920px",
      },
    },
  },
  plugins: [
    tailgrids,

    function ({ addUtilities, addComponents, theme }) {
      const newUtilities = {
        // Gradient text utilities
        ".gradient-text-teal": {
          background: `linear-gradient(135deg, ${theme("colors.teal.500")}, ${theme("colors.emerald.500")})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
        },
        ".gradient-text-tropical": {
          background: `linear-gradient(135deg, ${theme("colors.secondary.500")}, ${theme("colors.sunshine.400")})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
        },
        ".gradient-text-forest": {
          background: `linear-gradient(135deg, ${theme("colors.primary.700")}, ${theme("colors.primary.500")})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
        },

        // Scrollbar utilities
        ".scrollbar-none": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".scrollbar-thin": {
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: theme("colors.neutral.100"),
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme("colors.teal.400"),
            borderRadius: "2px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: theme("colors.teal.500"),
          },
        },

        ".text-balance": {
          "text-wrap": "balance",
        },
      };

      const newComponents = {
        // Button variants matching frontend
        ".btn": {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: theme("borderRadius.lg"),
          fontWeight: theme("fontWeight.semibold"),
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:focus": {
            outline: "2px solid transparent",
            outlineOffset: "2px",
          },
        },
        ".btn-primary": {
          background: `linear-gradient(to bottom right, ${theme("colors.primary.DEFAULT")}, ${theme("colors.primary.600")}, ${theme("colors.primary.700")})`,
          color: theme("colors.white"),
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: theme("boxShadow.nature-medium"),
          },
        },
        ".btn-teal": {
          background: `linear-gradient(to bottom right, ${theme("colors.teal.500")}, ${theme("colors.teal.600")}, ${theme("colors.emerald.600")})`,
          color: theme("colors.white"),
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: theme("boxShadow.teal-glow"),
          },
        },
        ".btn-coral": {
          background: `linear-gradient(to bottom right, ${theme("colors.secondary.DEFAULT")}, ${theme("colors.secondary.600")}, ${theme("colors.accent.600")})`,
          color: theme("colors.white"),
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: theme("boxShadow.medium"),
          },
        },

        // Card variants matching frontend
        ".card-primary": {
          background: `linear-gradient(to bottom right, ${theme("colors.primary.DEFAULT")}, ${theme("colors.primary.600")}, ${theme("colors.primary.700")})`,
          borderRadius: theme("borderRadius.3xl"),
          boxShadow: theme("boxShadow.nature-large"),
          color: theme("colors.white"),
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme("boxShadow.nature-large"),
          },
        },
        ".card-teal": {
          background: `linear-gradient(to bottom right, ${theme("colors.teal.500")}, ${theme("colors.teal.600")}, ${theme("colors.emerald.600")})`,
          borderRadius: theme("borderRadius.3xl"),
          boxShadow: theme("boxShadow.large"),
          color: theme("colors.white"),
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme("boxShadow.emerald-glow"),
          },
        },
        ".card-white": {
          backgroundColor: theme("colors.white"),
          borderRadius: theme("borderRadius.2xl"),
          boxShadow: theme("boxShadow.soft"),
          border: `1px solid ${theme("colors.neutral.200")}`,
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme("boxShadow.medium"),
          },
        },
      };

      addUtilities(newUtilities);
      addComponents(newComponents);
    },
  ],
};
