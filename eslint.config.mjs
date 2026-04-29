import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**'] },
  ...tseslint.configs.recommended,
  reactHooks.configs.flat['recommended-latest'],
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
);
