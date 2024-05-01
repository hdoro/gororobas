// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['src/edgeql/', 'src/edgedb.interfaces.ts'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
)
