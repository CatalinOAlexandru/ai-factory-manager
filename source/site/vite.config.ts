import { defineConfig } from "vite";

// The site is Factory Design's static page (design/src/site.html), copied and path-rewritten
// by ../tools/build-site.mjs into index.html and public/. Vite only serves and bundles it.
export default defineConfig({
  base: "./",
  server: { port: 5191, strictPort: true, host: true },
  preview: { port: 5191, strictPort: true, host: true },
});
