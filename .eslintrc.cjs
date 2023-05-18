/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "plugin:prettier/recommended",
    "eslint:recommended",
    "plugin:vue/vue3-essential",
    "@vue/eslint-config-prettier/skip-formatting",
  ],
  overrides: [],

  parser: "vue-eslint-parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["prettier", "vue"],
  globals: {},
  rules: {
    "prettier/prettier": "error",
    "no-var": "error",
    "no-debugger": "warn",
    semi: ["error", "always"],
  },
};
