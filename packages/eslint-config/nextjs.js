const base = require('./index.js');

module.exports = {
  ...base,
  extends: [
    ...base.extends,
    'next/core-web-vitals',
  ],
  rules: {
    ...base.rules,
    '@typescript-eslint/no-explicit-any': 'warn',
    '@next/next/no-html-link-for-pages': 'error',
  },
};





