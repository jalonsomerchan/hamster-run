import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**'],
  },
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
      // The game loop keeps a few large stateful helpers in one file on purpose.
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
];
