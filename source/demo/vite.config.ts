import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { themeAliases, syncBrand } from "../shared/vite-theme";

syncBrand(resolve(__dirname, "public"));

// BASE_PATH lets a later combined build serve the demo under ./demo/.
export default defineConfig({
  base: process.env.BASE_PATH ?? "./",
  plugins: [react(), tailwindcss()],
  resolve: { alias: themeAliases() },
  server: { port: 5190, strictPort: true, host: true },
  preview: { port: 5190, strictPort: true, host: true },
  build: { chunkSizeWarningLimit: 1200 },
});
