import * as jsoncParser from 'jsonc-eslint-parser';
import baseConfig from '../../eslint.config';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/vitest.config.{js,ts,mjs,mts}',
          ],
        },
      ],
    },
    languageOptions: {
      parser: jsoncParser,
    },
  },
  {
    ignores: ['**/out-tsc'],
  },
];



