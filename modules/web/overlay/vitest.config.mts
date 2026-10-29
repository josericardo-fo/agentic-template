import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    // e2e/ pertence ao Playwright
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
