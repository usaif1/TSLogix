import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vite.dev/config/
export default defineConfig({

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Map @ to your src directory
    },
  },
  plugins: [
    react(), 
    tailwindcss(),
    svgr({
      // Enable SVG imports as React components
      svgrOptions: {
        exportType: 'default',
      },
    }),
  ],
  server:{
    port: 7070,
  }
});
