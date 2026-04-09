import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("recharts") || id.includes("d3-")) {
            return "vendor-charts";
          }
          if (id.includes("react-dom")) {
            return "vendor-react";
          }
          if (id.includes("react-router")) {
            return "vendor-router";
          }
          if (id.includes("@tanstack")) {
            return "vendor-query";
          }
          if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("/zod/")) {
            return "vendor-form";
          }
          if (id.includes("@base-ui") || id.includes("lucide-react")) {
            return "vendor-ui";
          }
          if (id.includes("better-auth") || id.includes("better-fetch") || id.includes("better-call")) {
            return "vendor-auth";
          }
          if (id.includes("date-fns")) {
            return "vendor-date";
          }
          if (id.includes("sonner")) {
            return "vendor-toast";
          }
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://ledgerly-service.vercel.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
