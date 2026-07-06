import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = [
  ...nextVitals,
  {
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    ignores: ['.next/**', 'playwright-report/**', 'test-results/**'],
  },
]

export default eslintConfig
