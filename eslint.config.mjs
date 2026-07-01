import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "**/.next/**",
    "**/node_modules/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
    "cryptotradehelper/**",
    "price-alert-bot/**",
  ]),
]);

export default eslintConfig;
