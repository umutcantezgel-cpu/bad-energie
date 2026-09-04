import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "legacy/**",
    "Pipeline Kopie 5/**",
    "01a05849-*/**",
    "01a0584a-*/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
