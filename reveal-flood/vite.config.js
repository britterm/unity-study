import { defineConfig } from "vite";

export default defineConfig({
  base: "/unity-study/",
  server: {
    host: "0.0.0.0",
    allowedHosts: ["brians-mac-mini"]
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: ["brians-mac-mini"]
  }
});
