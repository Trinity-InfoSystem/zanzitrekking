import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugin to ensure React chunk loads first in HTML
function ensureReactFirst() {
  return {
    name: "ensure-react-first",
    transformIndexHtml(html) {
      // Find all modulepreload links
      const allPreloads = html.match(/<link\s+rel="modulepreload"[^>]*>/gi) || [];
      
      if (allPreloads.length === 0) return html;
      
      // Separate react-vendor from others
      const reactVendorPreloads = allPreloads.filter(link => 
        link.includes("react-vendor")
      );
      const otherPreloads = allPreloads.filter(link => 
        !link.includes("react-vendor")
      );
      
      if (reactVendorPreloads.length === 0) return html;
      
      // Remove all modulepreload links
      let newHtml = html.replace(/<link\s+rel="modulepreload"[^>]*>/gi, "");
      
      // Find the position right before the main script tag
      const scriptMatch = newHtml.match(/<script[^>]*type="module"[^>]*>/i);
      if (scriptMatch) {
        const scriptIndex = newHtml.indexOf(scriptMatch[0]);
        // Insert react-vendor preloads first, then others
        // This ensures react-vendor is preloaded before other chunks
        const allPreloadsOrdered = [...reactVendorPreloads, ...otherPreloads].join("\n    ");
        newHtml = newHtml.slice(0, scriptIndex) + 
                 `    ${allPreloadsOrdered}\n` + 
                 newHtml.slice(scriptIndex);
      }
      
      return newHtml;
    },
  };
}

export default defineConfig(({ mode }) => {
  const plugins = [
    react({
      include: "**/*.{jsx,js}", // Enable JSX in .js files
    }),
    ensureReactFirst(),
  ];

  if (mode === "analyze") {
    plugins.push(
      visualizer({
        open: true,
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
      })
    );
  }

  return {
    plugins,

    // ✅ CRITICAL: Deduplicate React - FIXED
    resolve: {
      dedupe: [
        "react",
        "react-dom",
        "react-router-dom",
        "@reduxjs/toolkit",
        "react-redux",
      ],
      alias: {
        // Force all React imports to use the same instance
        react: path.resolve(__dirname, "./node_modules/react"),
        "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
        "react/jsx-runtime": path.resolve(__dirname, "./node_modules/react/jsx-runtime"),
      },
    },

    define: {
      "process.env": {
        REACT_APP_FACEBOOK_APP_ID: "1185472906716613",
      },
    },

    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // CRITICAL: Order matters! Check most specific first, then general
            
            // 1. React core - MUST load first
            if (
              id.includes("node_modules/react/") || 
              id.includes("node_modules\\react\\") ||
              id.includes("node_modules/react-dom/") || 
              id.includes("node_modules\\react-dom\\") ||
              id.includes("node_modules/react/jsx-runtime") ||
              id.includes("node_modules\\react\\jsx-runtime") ||
              id.includes("/react/") ||
              id.includes("\\react\\") ||
              id.includes("/react-dom/") ||
              id.includes("\\react-dom\\")
            ) {
              return "react-vendor";
            }
            
            // 2. React Redux - MUST be in react-vendor since it uses useSyncExternalStore
            // This ensures React is loaded before react-redux initializes
            if (id.includes("react-redux")) {
              return "react-vendor";
            }
            
            // 3. Redux Toolkit - can be separate but depends on react-redux
            if (id.includes("@reduxjs/toolkit")) {
              return "redux-vendor";
            }
            
            // 4. React Router - depends on React
            if (id.includes("react-router")) {
              return "react-vendor";
            }

            // 5. Critical React packages that use hooks - MUST be in react-vendor
            // These packages use React hooks and need React to be loaded first
            if (
              id.includes("react-hot-toast") ||
              id.includes("react-helmet-async") ||
              id.includes("@react-oauth/google")
            ) {
              return "react-vendor";
            }

            // 6. MUI + Emotion — keep in react-vendor to avoid a circular chunk edge
            // (ui-vendor <-> react-vendor) that surfaces as "Cannot access before initialization" in prod.
            if (id.includes("@mui/material") || id.includes("@emotion")) {
              return "react-vendor";
            }

            // 7. React Leaflet - depends on React
            if (id.includes("leaflet") || id.includes("react-leaflet")) {
              return "map-vendor";
            }

            // 8. Other React components that use hooks - move to react-vendor
            // to avoid circular dependencies and ensure React loads first
            if (
              id.includes("react-multi-carousel") ||
              id.includes("react-range") ||
              id.includes("react-rating") ||
              id.includes("react-icons") ||
              id.includes("react-spinners") ||
              id.includes("commonninja-react") ||
              id.includes("lucide-react")
            ) {
              return "react-vendor";
            }

            // 8. Axios / date-fns — keep in react-vendor to avoid utils-vendor <-> react-vendor cycles
            if (id.includes("axios") || id.includes("date-fns")) {
              return "react-vendor";
            }

            // 9. Handle remaining node_modules - check specific ones first
            if (id.includes("node_modules")) {
              // Specific vendor chunks first - be exhaustive
              if (id.includes("aos")) {
                return "animation";
              }
              if (id.includes("socket.io")) {
                return "react-vendor";
              }
              if (id.includes("stripe")) {
                return "payment-vendor";
              }
              if (id.includes("emoji-picker-react")) {
                return "chat-vendor";
              }
              if (id.includes("swiper")) {
                return "swiper-vendor";
              }
              if (id.includes("jwt-decode")) {
                return "react-vendor";
              }
              
              // CRITICAL: Check for React-related packages BEFORE allowing vendor
              // This prevents react-redux from ending up in vendor
              const isReactRelated = 
                id.includes("react") ||
                id.includes("redux") ||
                id.includes("@mui") ||
                id.includes("@emotion");
              
              if (isReactRelated) {
                // Put any missed React packages in react-vendor to ensure React loads first
                return "react-vendor";
              }
              
              // Avoid creating a generic vendor chunk to prevent circular dependencies
              // Put all remaining node_modules in react-vendor to be safe
              // This ensures React is loaded before any other code executes
              return "react-vendor";
            }
          },
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        },
      },

      esbuild: {
        loader: {
          ".js": "jsx",
        },
      },
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.info", "console.debug"],
          passes: 2,
        },
        format: {
          comments: false,
        },
      },

      chunkSizeWarningLimit: 1000,
      sourcemap: false,
      target: "es2015",
      cssCodeSplit: true,

      commonjsOptions: {
        include: [/aos/, /node_modules/],
        transformMixedEsModules: true,
      },
    },

    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-router-dom",
        "@reduxjs/toolkit",
        "react-redux",
        "axios",
        "aos",
      ],
      exclude: ["emoji-picker-react"],
      esbuildOptions: {
        target: "es2020",
        loader: {
          ".js": "jsx",
        },
      },
      force: true,
    },

    server: {
      hmr: {
        overlay: true,
      },
    },

    preview: {
      // Configure preview server for SPA routing
      port: 3000,
      strictPort: true,
    },
  };
});