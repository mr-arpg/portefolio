import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Project Pages serves this repo at /portefolio/. A custom domain serves the
// same files from /. Set VITE_BASE_PATH=/ when that domain is connected.
const base = process.env.VITE_BASE_PATH ?? "/portefolio/";

export default defineConfig({
  base,
  plugins: [
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: false,
      },
    }),
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
