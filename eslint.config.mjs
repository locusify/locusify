import antfu from '@antfu/eslint-config'

export default antfu({
  next: true,
  ignores: ['node_modules', 'dist', '**/*.md'],
  rules: {
    'no-console': 'off',
    'eslint-comments/no-duplicate-disable': 'off',
    'antfu/no-top-level-await': 'off',
  },
})
