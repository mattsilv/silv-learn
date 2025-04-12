import js from '@eslint/js'
import globals from 'globals'
import reactRecommended from 'eslint-plugin-react/configs/recommended.js'
import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js'
import jsxA11yRecommended from 'eslint-plugin-jsx-a11y/configs/recommended.js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettierConfig from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactRecommended,
  reactJsxRuntime,
  jsxA11yRecommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: { // Needed for React plugins
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      // 'react' and 'jsx-a11y' plugins are implicitly added by their configs
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Add any custom rule overrides here if needed
    },
    settings: { // Needed for React plugins
      react: {
        version: 'detect',
      },
    },
  },
  prettierConfig, // Must be last to override other configs
)
