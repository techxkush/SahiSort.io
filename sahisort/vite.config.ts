import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    envDir: ".",
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
