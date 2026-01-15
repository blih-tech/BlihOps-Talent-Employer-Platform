const base = require('./index.js');

module.exports = {
  ...base,
  extends: [
    ...base.extends,
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    ...base.rules,
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};





