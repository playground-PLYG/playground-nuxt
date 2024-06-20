// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    stylistic: false,
    tooling: true
  }
})
  .prepend(
    {
      ignores: ['node_modules/**', '.nuxt/**']
    },
    {
      languageOptions: {
        globals: {
          $fetch: 'readonly',
          NodeJS: 'readonly'
        }
      },
      name: 'local/settings',
      settings: {
        jsdoc: {
          ignoreInternal: true,
          tagNamePreference: {
            note: 'note',
            warning: 'warning'
          }
        }
      }
    }
  )

  .override('nuxt/javascript', {
    rules: {
      curly: ['error', 'all'], // Including if blocks with a single statement
      'dot-notation': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'debug'] }],
      'no-lonely-if': 'error', // No single if in an "else" block
      'no-useless-rename': 'error',
      'object-shorthand': 'error',
      'prefer-const': [
        'error',
        { destructuring: 'any', ignoreReadBeforeAssign: false }
      ],
      'require-await': 'error',
      'sort-imports': ['error', { ignoreDeclarationSort: true }]
    }
  })

  .override('nuxt/typescript/rules', {
    rules: {
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true
        }
      ],
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      '@typescript-eslint/ban-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-invalid-void-type': 'off'
    }
  })

  .override('nuxt/tooling/unicorn', {
    rules: {
      'unicorn/no-new-array': 'off',
      'unicorn/prefer-dom-node-text-content': 'off'
    }
  })

  .override('nuxt/vue/rules', {
    rules: {
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'any',
            normal: 'always',
            component: 'always'
          },
          svg: 'always',
          math: 'always'
        }
      ]
    }
  })

  // Append local rules
  .append({
    files: [
      '**/*.vue',
      '**/*.ts',
      '**/*.mts',
      '**/*.js',
      '**/*.cjs',
      '**/*.mjs'
    ],
    name: 'local/rules',
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              from: 'packages/nuxt/src/!(core)/**/*',
              message: 'core should not directly import from modules.',
              target: 'packages/nuxt/src/core'
            },
            {
              from: 'packages/nuxt/src/!(app)/**/*',
              message: 'app should not directly import from modules.',
              target: 'packages/nuxt/src/app'
            },
            {
              from: 'packages/nuxt/src/app/**/index.ts',
              message: 'should not import from barrel/index files',
              target: 'packages/nuxt/src'
            },
            {
              from: 'packages/nitro',
              message: 'nitro should not directly import other packages.',
              target: 'packages/!(nitro)/**/*'
            }
          ]
        }
      ],
      'import/order': [
        'error',
        {
          pathGroups: [
            {
              group: 'external',
              pattern: '#vue-router'
            }
          ]
        }
      ],
      'jsdoc/check-tag-names': [
        'error',
        {
          definedTags: ['experimental', '__NO_SIDE_EFFECTS__']
        }
      ]
    }
  })
  .override('local/rules', {
    files: ['pages/upload.vue'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Disable for these files only
      '@eslint/no-debug': 'off'
    }
  })
