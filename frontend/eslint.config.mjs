import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

const { flatConfig: nextFlatConfig } = nextPlugin;

export default tseslint.config(
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"]
  },
  ...tseslint.configs.recommended,
  nextFlatConfig.coreWebVitals
);
