import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['node_modules', 'dist', '*.md'],
  rules: {
    'no-console': 'off',
  },
})
