import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    // SVGR phải đứng trước để chặn *.svg?react
    svgr({
      include: "**/*.svg?react",
      svgrOptions: { icon: true },
      exportAsDefault: true, // xuất default để dùng import X from "...?react"
    }),
    react(),
  ],
});