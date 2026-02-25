import { defineConfig } from "vite";

export default defineConfig({
  server: {
    fs: {
      allow: ["."],  // access pkg/ folder
    },
  },
});
