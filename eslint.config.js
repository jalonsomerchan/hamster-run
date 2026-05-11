import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['src/js/app.js'],
    rules: {
      // app.js is loaded as raw source and patched by app-life-bootstrap-v3.js.
      // These symbols are intentionally provided/used by that runtime patch layer.
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
];
