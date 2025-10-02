import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Disable the base ESLint rule as it can report incorrect errors
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn", // or 'error'
        {
          // Ignore unused arguments that start with an underscore
          argsIgnorePattern: "^_",
          // Ignore unused variables that start with an underscore
          varsIgnorePattern: "^_",
          // Ignore unused catch clause parameters that start with an underscore
          caughtErrorsIgnorePattern: "^_",
          // Ignore unused properties when using object destructuring
          ignoreRestSiblings: true,
        },
      ],
      // Other React-specific rules
      "react/react-in-jsx-scope": "off", // For React 17+ where React is not required in scope
      "react/jsx-uses-react": "off", // Also for React 17+
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);
