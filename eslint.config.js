import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import libram from 'eslint-plugin-libram';

export default [
    // Base recommended configs
    js.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,

    // Main configuration
    {
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            'libram': libram,
        },

        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
            },
        },

        rules: {
            'block-scoped-var': 'error',
            'eol-last': 'error',
            'eqeqeq': 'error',
            'no-trailing-spaces': 'error',
            'no-var': 'error',
            'prefer-arrow-callback': 'error',
            'prefer-const': 'error',
            'prefer-template': 'error',
            'sort-imports': [
                'error',
                {
                    ignoreCase: true,
                    ignoreDeclarationSort: true,
                },
            ],
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'error',
            'libram/verify-constants': 'error',
        },
    },

    // Ignore patterns (replaces .eslintignore)
    {
        ignores: [
            'KoLmafia/scripts/**',
            'node_modules/**',
            'dist/**', // You might want to ignore build output too
        ],
    },
];
