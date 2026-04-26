import { fileURLToPath } from "node:url";
import { mergeConfig, defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      watch: false,
      root: fileURLToPath(new URL("./", import.meta.url)),
      include: ["test/**/*.spec.ts"],
      setupFiles: ["./test/setup.ts"]
    },
  }),
);