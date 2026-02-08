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
              "Bearer ef5d32140b2702e0bf29879056a576aae011a782-55ae5",
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
