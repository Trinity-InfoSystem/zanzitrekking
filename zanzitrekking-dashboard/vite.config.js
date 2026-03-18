import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/safari": {
        target: "https://api.safarioffice.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/safari/, ""),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            // Add the authorization header with the COMPLETE token
            proxyReq.setHeader(
              "Authorization",
              `Bearer ${import.meta.env.VITE_SAFARI_API_TOKEN}`
            );
          });
        },
      },
      "/api/safari-analytics": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
