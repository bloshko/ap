// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  // if base path uses '/' as it's value (this is the default setting), Github Pages can't fetch assets since they look for path from the root
  base: "",
});
