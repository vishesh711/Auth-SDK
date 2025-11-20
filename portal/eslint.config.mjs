import nextPlugin from "@next/eslint-plugin-next";

const coreWebVitalsConfig = nextPlugin.configs["core-web-vitals"];

export default [
  {
    ignores: ["node_modules", ".next", "dist"],
  },
  {
    ...coreWebVitalsConfig,
    rules: {
      ...coreWebVitalsConfig.rules,
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
];