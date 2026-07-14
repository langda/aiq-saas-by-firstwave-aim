import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Layer boundaries (PROJECT_STRUCTURE §1): dependencies point downward only.
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": { typescript: {} },
      "boundaries/elements": [
        { type: "core", pattern: "src/core/**" },
        { type: "lib", pattern: "src/lib/**" },
        { type: "components", pattern: "src/components/**" },
        { type: "hooks", pattern: "src/hooks/**" },
        { type: "features", pattern: "src/features/**" },
        { type: "app", pattern: "src/app/**" },
        { type: "middleware", pattern: "src/proxy.ts", partialMatch: false },
      ],
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          message:
            "Layer boundary violation - dependencies point downward only (PROJECT_STRUCTURE.md §1)",
          policies: [
            { from: [{ type: "core" }], allow: [{ type: "core" }] },
            {
              from: [{ type: "lib" }],
              allow: [{ type: "lib" }, { type: "core" }],
            },
            {
              from: [{ type: "components" }],
              allow: [
                { type: "components" },
                { type: "hooks" },
                { type: "lib" },
                { type: "core" },
              ],
            },
            {
              from: [{ type: "hooks" }],
              allow: [{ type: "hooks" }, { type: "lib" }, { type: "core" }],
            },
            {
              from: [{ type: "features" }],
              allow: [
                { type: "features" },
                { type: "components" },
                { type: "hooks" },
                { type: "lib" },
                { type: "core" },
              ],
            },
            {
              from: [{ type: "app" }],
              allow: [
                { type: "app" },
                { type: "features" },
                { type: "components" },
                { type: "hooks" },
                { type: "lib" },
                { type: "core" },
              ],
            },
            {
              from: [{ type: "middleware" }],
              allow: [{ type: "lib" }, { type: "core" }],
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "supabase/**",
  ]),
]);

export default eslintConfig;
