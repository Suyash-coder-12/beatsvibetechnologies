import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function no304Plugin() {
  const attach = (server) => {
    server.middlewares.use((req, res, next) => {
      delete req.headers["if-none-match"];
      delete req.headers["if-modified-since"];
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      const originalSetHeader = res.setHeader.bind(res);
      res.setHeader = (name, value) => {
        const lower = String(name).toLowerCase();
        if (lower === "etag" || lower === "last-modified") return res;
        if (lower === "cache-control") {
          return originalSetHeader(name, "no-store, no-cache, must-revalidate, proxy-revalidate");
        }
        return originalSetHeader(name, value);
      };
      next();
    });
  };
  return {
    name: "no-304-responses",
    configureServer: attach,
    configurePreviewServer: attach,
  };
}

export default defineConfig({
  plugins: [react(), no304Plugin()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/recharts/") || id.includes("/node_modules/victory-vendor/")) {
            return "charts";
          }
          if (id.includes("/node_modules/react/") || id.includes("/node_modules/react-dom/") || id.includes("/node_modules/scheduler/")) {
            return "react-vendor";
          }
        },
      },
    },
  },
});
