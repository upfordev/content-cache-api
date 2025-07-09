import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    ignores: [
      "node_modules/**",
      ".wrangler/**",
      "pnpm-lock.yaml",
      "package-lock.json",
      "worker-configuration.d.ts",
    ],
  },
];
