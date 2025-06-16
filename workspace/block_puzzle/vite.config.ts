import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/block_puzzle/",
  server: {
    port: 8080,
    open: true,
  },
});
