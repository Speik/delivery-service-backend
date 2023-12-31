module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: { node: true, },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
    }],
    'no-undef': 'off',
    'no-trailing-spaces': 'error',
    'no-multi-spaces': ['error'],
    'indent': ['error', 2, {
      'SwitchCase': 1,
      'ignoredNodes': ['PropertyDefinition'],
    }],
    'semi': ['error', 'always'],
    'quotes': [2, 'single'],
    'object-curly-spacing': ['error', 'always'],
    'key-spacing': ['error', { 'beforeColon': false }],
    'keyword-spacing': ['error', { 'before': true, 'after': true }],
    'arrow-spacing': ['error', { 'before': true, 'after': true }],
    'block-spacing': ['error', 'never'],
    'comma-spacing': ['error', { 'before': false, 'after': true }],
    'space-before-blocks': ['error', { 'functions': 'always', 'keywords': 'always', 'classes': 'always' }],
    'require-await': 'error',
    'space-infix-ops': 'error',
    'no-nested-ternary': 'error',
    'camelcase': 'error',
    'eqeqeq': ['error', 'always'],
    'no-empty': ['error', { 'allowEmptyCatch': false }],
    'comma-dangle': ['error', 'only-multiline'],
    'prefer-const': 'warn',
    'no-unused-vars': 'off',
    'no-unused-expressions': 'warn',
    'max-len': ["warn", { "code": 100 }],
  },
};
