import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // loadEnv is required here: import.meta.env is not reliable inside dev-server proxy callbacks
  const env = loadEnv(mode, process.cwd(), "");
  const safariApiToken = env.VITE_SAFARI_API_TOKEN ?? "";

  return {
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
              proxyReq.setHeader(
                "Authorization",
                `Bearer ${safariApiToken}`
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
  };
});
