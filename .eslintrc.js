module.exports = {
    extends: [
        "next/core-web-vitals",
        "next/typescript"
    ],
    rules: {
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
        "@typescript-eslint/no-explicit-any": "off",
        "no-console": "off",
        "no-debugger": "error",
        "no-alert": "off",
        "no-undef": "off",
        "prefer-const": "off"
    },
    env: {
        browser: true,
        node: true,
        es6: true
    },
    globals: {
        React: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        alert: "readonly",
        confirm: "readonly"
    }
};
