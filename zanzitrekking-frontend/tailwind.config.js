/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  safelist: [
    "from-red-500",
    "to-pink-500",
    "from-blue-500",
    "to-cyan-500",
    "from-green-500",
    "to-emerald-500",
    "from-purple-500",
    "to-violet-500",
    "from-orange-500",
    "to-amber-500",
    "from-teal-500",
    "to-cyan-500",
    "bg-gradient-to-r",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1a1a1a",
          50: "#f5f5f5",
          100: "#e5e5e5",
          200: "#cccccc",
          300: "#999999",
          400: "#666666",
          500: "#333333",
          600: "#1a1a1a",
          700: "#141414",
          800: "#0f0f0f",
          900: "#0a0a0a",
          950: "#050505",
        },

        secondary: {
          DEFAULT: "#e8927c",
          50: "#fef6f4",
          100: "#fdeae5",
          200: "#fbd4cc",
          300: "#f7b5a3",
          400: "#f09073",
          500: "#e8927c",
          600: "#d66b52",
          700: "#b85540",
          800: "#984839",
          900: "#7d3f35",
          950: "#4a2520",
        },

        accent: {
          DEFAULT: "#e8b44c",
          50: "#fefbf3",
          100: "#fdf5e1",
          200: "#fbe9c3",
          300: "#f7d895",
          400: "#f2c265",
          500: "#e8b44c",
          600: "#d69a2f",
          700: "#b37d26",
          800: "#926325",
          900: "#785223",
          950: "#452f15",
        },

        highlight: {
          DEFAULT: "#c85a54",
          50: "#fdf4f3",
          100: "#fbe8e7",
          200: "#f7d4d3",
          300: "#efb3b0",
          400: "#e48882",
          500: "#d66058",
          600: "#c85a54",
          700: "#a03d38",
          800: "#853732",
          900: "#70332f",
          950: "#421e1d",
        },

        neutral: {
          DEFAULT: "#ffffff",
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
          950: "#0a0a0a",
        },

        brand: {
          green: "#2d5f4f",
          coral: "#e8927c",
          yellow: "#e8b44c",
          red: "#c85a54",
          "green-light": "#87c4a9",
          "coral-light": "#f7b5a3",
          "yellow-light": "#f7d895",
          "text-dark": "#292524",
          "text-medium": "#57534e",
          "text-light": "#78716c",
        },

        success: {
          DEFAULT: "#3d8a69",
          50: "#f0f7f4",
          100: "#d9ede5",
          200: "#b6dccb",
          300: "#87c4a9",
          400: "#5aa585",
          500: "#3d8a69",
          600: "#2d5f4f",
          700: "#254d40",
          800: "#1f3e34",
          900: "#1a342c",
          950: "#0f1d18",
        },

        warning: {
          DEFAULT: "#e8b44c",
          50: "#fefbf3",
          100: "#fdf5e1",
          200: "#fbe9c3",
          300: "#f7d895",
          400: "#f2c265",
          500: "#e8b44c",
          600: "#d69a2f",
          700: "#b37d26",
          800: "#926325",
          900: "#785223",
          950: "#452f15",
        },

        error: {
          DEFAULT: "#c85a54",
          50: "#fdf4f3",
          100: "#fbe8e7",
          200: "#f7d4d3",
          300: "#efb3b0",
          400: "#e48882",
          500: "#d66058",
          600: "#c85a54",
          700: "#a03d38",
          800: "#853732",
          900: "#70332f",
          950: "#421e1d",
        },

        info: {
          DEFAULT: "#5aa585",
          50: "#f0f7f4",
          100: "#d9ede5",
          200: "#b6dccb",
          300: "#87c4a9",
          400: "#5aa585",
          500: "#3d8a69",
          600: "#2d5f4f",
          700: "#254d40",
          800: "#1f3e34",
          900: "#1a342c",
          950: "#0f1d18",
        },

        text: {
          DEFAULT: "#292524",
          light: "#57534e",
          lighter: "#78716c",
          lightest: "#a8a29e",
          dark: "#1c1917",
          inverse: "#ffffff",
          muted: "#78716c",
          accent: "#2d5f4f",
          brand: "#2d5f4f",
        },

        background: {
          DEFAULT: "#ffffff",
          paper: "#fafaf9",
          muted: "#f5f5f4",
          elevated: "#ffffff",
          soft: "#fef6f4",
          subtle: "#f0f7f4",
          dark: "#1c1917",
          "dark-elevated": "#292524",
        },

        glow: {
          green: "rgba(45, 95, 79, 0.20)",
          coral: "rgba(232, 146, 124, 0.25)",
          yellow: "rgba(232, 180, 76, 0.25)",
          red: "rgba(200, 90, 84, 0.20)",
        },

        glass: {
          light: "rgba(255, 255, 255, 0.8)",
          medium: "rgba(255, 255, 255, 0.6)",
          dark: "rgba(15, 23, 42, 0.05)",
          soft: "rgba(248, 250, 252, 0.9)",
          subtle: "rgba(241, 245, 249, 0.8)",
        },

        mainColor: "#2d5f4f",
      },

      backgroundImage: {
        "brand-primary": "linear-gradient(135deg, #2d5f4f 0%, #3d8a69 100%)",
        "brand-secondary": "linear-gradient(135deg, #e8927c 0%, #f09073 100%)",
        "brand-accent": "linear-gradient(135deg, #e8b44c 0%, #f2c265 100%)",
        "soft-green": "linear-gradient(135deg, #d9ede5 0%, #b6dccb 100%)",
        "soft-coral": "linear-gradient(135deg, #fdeae5 0%, #fbd4cc 100%)",
        "soft-yellow": "linear-gradient(135deg, #fdf5e1 0%, #fbe9c3 100%)",
        tropical:
          "linear-gradient(135deg, #2d5f4f 0%, #e8927c 50%, #e8b44c 100%)",
        sunset: "linear-gradient(135deg, #e8b44c 0%, #e8927c 100%)",
        forest: "linear-gradient(135deg, #254d40 0%, #3d8a69 100%)",
      },

      boxShadow: {
        soft: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03)",
        "soft-md":
          "0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        "soft-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        "soft-xl":
          "0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
        medium:
          "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
        large:
          "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        dropdown: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        elevated: "0 4px 12px rgba(0, 0, 0, 0.05)",
        "elevated-lg": "0 8px 16px rgba(0, 0, 0, 0.08)",
        "indigo-soft": "0 8px 16px -4px rgba(99, 102, 241, 0.15)",
        "violet-soft": "0 8px 16px -4px rgba(139, 92, 246, 0.15)",
      },

      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
        fadeOut: "fadeOut 0.5s ease-in-out",
        slideUp: "slideUp 0.4s ease-out",
        slideDown: "slideDown 0.4s ease-out",
        scaleIn: "scaleIn 0.3s ease-out",
        "spin-slow": "spin 3s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        gradientX: "gradientX 3s ease infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },

      fontFamily: {
        sans: [
          "Inter var",
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Clash Display",
          "Inter var",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        serif: ["Playfair Display", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },

      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
        144: "36rem",
      },

      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },

      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        tablet: "817px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1920px",
      },

      backdropBlur: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "40px",
        "3xl": "64px",
      },
    },
  },
  plugins: [
    function ({ addUtilities, addComponents, theme }) {
      const newUtilities = {
        ".text-professional": {
          color: theme("colors.brand.text-dark"),
        },
        ".text-accent-soft": {
          color: theme("colors.primary.500"),
        },
        ".text-slate": {
          color: theme("colors.primary.600"),
        },
        ".gradient-text-professional": {
          background: `linear-gradient(135deg, ${theme("colors.secondary.500")}, ${theme("colors.accent.500")})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
        },
        ".gradient-text-tropical": {
          background: `linear-gradient(135deg, ${theme("colors.primary.500")}, ${theme("colors.secondary.500")}, ${theme("colors.accent.500")})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
        },
        ".gradient-text-soft": {
          background: `linear-gradient(135deg, ${theme("colors.secondary.400")}, ${theme("colors.accent.400")})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
        },
        ".glass-professional": {
          backgroundColor: theme("colors.glass.light"),
          backdropFilter: "blur(12px) saturate(180%)",
          border: `1px solid ${theme("colors.neutral.200")}`,
        },
        ".glass-soft": {
          backgroundColor: theme("colors.glass.soft"),
          backdropFilter: "blur(10px) saturate(160%)",
          border: `1px solid ${theme("colors.neutral.100")}`,
        },
        ".scrollbar-professional": {
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: theme("colors.neutral.100"),
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme("colors.primary.300"),
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: theme("colors.primary.400"),
          },
        },
        ".text-balance": {
          "text-wrap": "balance",
        },
        ".scrollbar-none": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      };

      const newComponents = {
        ".btn": {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: theme("borderRadius.lg"),
          fontWeight: theme("fontWeight.medium"),
          transition: "all 0.2s ease-in-out",
          "&:focus": {
            outline: "2px solid transparent",
            outlineOffset: "2px",
            boxShadow: `0 0 0 3px ${theme("colors.secondary.200")}`,
          },
        },
        ".btn-primary": {
          backgroundColor: theme("colors.primary.600"),
          color: theme("colors.white"),
          "&:hover": {
            backgroundColor: theme("colors.primary.700"),
            transform: "translateY(-1px)",
            boxShadow: theme("boxShadow.soft-md"),
          },
        },
        ".btn-secondary": {
          backgroundColor: theme("colors.secondary.500"),
          color: theme("colors.white"),
          "&:hover": {
            backgroundColor: theme("colors.secondary.600"),
            transform: "translateY(-1px)",
            boxShadow: theme("boxShadow.soft-md"),
          },
        },
        ".btn-accent": {
          backgroundColor: theme("colors.accent.500"),
          color: theme("colors.white"),
          "&:hover": {
            backgroundColor: theme("colors.accent.600"),
            transform: "translateY(-1px)",
            boxShadow: theme("boxShadow.soft-md"),
          },
        },
        ".btn-outline": {
          backgroundColor: "transparent",
          color: theme("colors.primary.600"),
          border: `1.5px solid ${theme("colors.primary.300")}`,
          "&:hover": {
            backgroundColor: theme("colors.primary.50"),
            borderColor: theme("colors.primary.400"),
            transform: "translateY(-1px)",
          },
        },
        ".card-professional": {
          backgroundColor: theme("colors.background.paper"),
          borderRadius: theme("borderRadius.2xl"),
          boxShadow: theme("boxShadow.soft"),
          border: `1px solid ${theme("colors.neutral.200")}`,
          overflow: "hidden",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme("boxShadow.soft-md"),
            borderColor: theme("colors.neutral.300"),
          },
        },
        ".card-elevated": {
          backgroundColor: theme("colors.background.elevated"),
          borderRadius: theme("borderRadius.2xl"),
          boxShadow: theme("boxShadow.elevated"),
          overflow: "hidden",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme("boxShadow.elevated-lg"),
          },
        },
        ".card-gradient": {
          background: theme("backgroundImage.brand-primary"),
          borderRadius: theme("borderRadius.2xl"),
          boxShadow: theme("boxShadow.soft"),
          color: theme("colors.white"),
          overflow: "hidden",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme("boxShadow.soft-lg"),
          },
        },
      };

      addUtilities(newUtilities);
      addComponents(newComponents);
    },
  ],
};
