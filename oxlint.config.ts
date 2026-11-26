import base, { createConfig } from '@metamask/oxlint-config';
import browser from '@metamask/oxlint-config-browser';
import commonjs from '@metamask/oxlint-config-commonjs';
import nodejs from '@metamask/oxlint-config-nodejs';
import typescript from '@metamask/oxlint-config-typescript';
import vitest from '@metamask/oxlint-config-vitest';

export default createConfig({
  extends: [base],

  ignorePatterns: ['.yarn/**', 'dist/**', 'node_modules/**'],

  options: {
    reportUnusedDisableDirectives: 'error',
    typeAware: true,
  },

  overrides: [
    {
      files: ['**/*.d.ts'],
      rules: {
        // Ambient declaration files have no imports or exports by nature.
        'import/unambiguous': 'off',

        // `ImportMetaEnv` must stay an `interface` to merge with Vite's declaration.
        'typescript/consistent-type-definitions': 'off',
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      excludeFiles: ['**/*.d.ts'],
      extends: [typescript],
      rules: {
        // Bundler module resolution: relative imports are extensionless.
        'import/extensions': 'off',

        // TypeScript reports undefined identifiers.
        'eslint/no-undef': 'off',
      },
    },

    {
      files: ['**/*.ts', '**/*.tsx'],
      excludeFiles: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/test/**',
        '**/tests/**',
      ],
      extends: [browser],
    },

    {
      // Entry files import CSS for its side effects.
      files: ['src/App.tsx', 'src/main.tsx'],
      rules: {
        'import/no-unassigned-import': 'off',
      },
    },

    {
      files: ['yarn.config.cjs', '**/*.cjs'],
      extends: [nodejs, commonjs],
      rules: {
        'import/unambiguous': 'off',
      },
    },

    {
      files: ['.github/**', '**/scripts/**'],
      extends: [nodejs],
    },

    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/test/**', '**/tests/**'],
      extends: [vitest],
      rules: {
        'node/no-sync': 'off',
        'node/no-process-env': 'off',
      },
    },
  ],
});
