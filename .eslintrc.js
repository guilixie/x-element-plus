module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended', // vue3解析 https://eslint.vuejs.org/
    'plugin:@typescript-eslint/recommended',
    '@vue/typescript/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error', // 将 Prettier 规则作为错误
    'vue/html-self-closing': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn', // 改为警告级别
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
  globals: {
    defineProps: 'readonly',
    defineOptions: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    defineModel: 'readonly',
    defineSlots: 'readonly',
    defineComponent: 'readonly',
  },
  overrides: [
    {
      files: ['.*.js', '**/config/**/*.js', '**/vitepress/**/*.ts'],
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off', // 允许 require
      },
    },
  ],
}
