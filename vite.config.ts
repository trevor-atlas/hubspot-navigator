import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { resolve } from "path";
import makeManifest from "./utils/plugins/make-manifest";
import customDynamicImport from "./utils/plugins/custom-dynamic-import";
import addHmr from "./utils/plugins/add-hmr";
import manifest from "./manifest";

const root = resolve(__dirname, "src");
const pagesDir = resolve(root, "pages");
const assetsDir = resolve(root, "assets");
const outDir = resolve(__dirname, "dist");
const publicDir = resolve(__dirname, "public");

const isDev = process.env.__DEV__ === "true";
const isProduction = !isDev;

// ENABLE HMR IN BACKGROUND SCRIPT
const enableHmrInBackgroundScript = true;

export default defineConfig({
  resolve: {
    alias: {
      "@src": root,
      "@assets": assetsDir,
      "@pages": pagesDir,
    },
  },
  plugins: [
    react(),
    makeManifest(manifest),
    customDynamicImport(),
    addHmr({ background: enableHmrInBackgroundScript, view: true }),
  ],
  publicDir,
  build: {
    outDir,
    /** Can slowDown build speed. */
    // sourcemap: isDev,
    minify: isProduction,
    reportCompressedSize: isProduction,
    rollupOptions: {
      input: {
        // devtools: resolve(pagesDir, "devtools", "index.html"),
        // panel: resolve(pagesDir, "panel", "index.html"),
        // content: resolve(pagesDir, "content", "index.ts"),
        background: resolve(root, "background.ts"),
        styles: resolve(root, "styles.scss"),
        popup: resolve(root, "popup.tsx"),
        // newtab: resolve(pagesDir, "newtab", "index.html"),
        // options: resolve(pagesDir, "options", "index.html"),
      },
      watch: {
        include: ["src/**", "vite.config.ts"],
        exclude: ["node_modules/**", "src/**/*.spec.ts"],
      },
      output: {
        entryFileNames: "src/[name].js",
        chunkFileNames: isDev
          ? "assets/js/[name].js"
          : "assets/js/[name].[hash].js",
        assetFileNames: (assetInfo) => {
          const { name } = path.parse(assetInfo.name!);
          return `assets/${name}.chunk.[ext]`;
        },
      },
    },
  },
});

function firstUpperCase(str: string) {
  const firstAlphabet = new RegExp(/( |^)[a-z]/, "g");
  return str.toLowerCase().replace(firstAlphabet, (L) => L.toUpperCase());
}