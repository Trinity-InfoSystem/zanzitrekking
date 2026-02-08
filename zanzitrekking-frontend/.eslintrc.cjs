module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs", "node_modules", "build"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: { version: "18.2" },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx"],
      },
    },
  },
  plugins: ["react-refresh"],
  rules: {
    // React specific rules
    "react/jsx-no-target-blank": "off",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],

    // Code quality rules
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "warn",
    "no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "no-var": "error",
    "prefer-const": "warn",
    "prefer-arrow-callback": "warn",
    "no-duplicate-imports": "error",
    "no-useless-return": "warn",
    "no-useless-concat": "warn",
    "prefer-template": "warn",

    // Best practices
    "eqeqeq": ["error", "always", { null: "ignore" }],
    "curly": ["error", "all"],
    "default-case": "warn",
    "default-case-last": "warn",
    "no-else-return": "warn",
    "no-implicit-coercion": "warn",
    "no-lonely-if": "warn",
    "no-nested-ternary": "warn",
    "no-unneeded-ternary": "warn",
    "prefer-exponentiation-operator": "warn",

    // Style and formatting (complement Prettier)
    "comma-dangle": ["error", "always-multiline"],
    "semi": ["error", "always"],
    "quotes": ["error", "double", { avoidEscape: true }],
    "object-shorthand": "warn",
    "prefer-destructuring": [
      "warn",
      {
        array: false,
        object: true,
      },
    ],

    // Import organization
    "sort-imports": [
      "warn",
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
      },
    ],
  },
};
