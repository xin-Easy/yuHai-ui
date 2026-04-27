// ESLint 配置文件
// 与 Prettier 配合使用，统一代码风格
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import pluginJs from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 加载 auto-import 配置
let autoImportConfig = { globals: {} }
try {
  autoImportConfig = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '.auto-import.json'), 'utf-8')
  )
} catch {
  autoImportConfig = { globals: {} }
}

export default [
  // 基础文件匹配
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}']
  },

  // 全局变量
  {
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  },

  // 继承推荐配置
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  // 自定义规则 - 与 Prettier 对齐
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],

    languageOptions: {
      globals: {
        ...autoImportConfig.globals,
        Api: 'readonly'
      }
    },

    rules: {
      // Prettier 负责格式化，这里只保留质量检查规则
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'no-var': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off',
      'no-multiple-empty-lines': ['warn', { max: 1 }],
      'no-unexpected-multiline': 'error',
      'accessor-pairs': 'error',
      'block-scoped-var': 'error',
      'consistent-return': 'warn',
      'default-case': 'warn',
      'eqeqeq': ['error', 'always'],
      'no-alert': 'warn',
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-empty': 'warn',
      'no-eval': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-implicit-coercion': 'warn',
      'no-new': 'warn',
      'no-return-await': 'error',
      'no-throw-literal': 'error',
      'no-useless-escape': 'off',
      'no-with': 'error',
      'prefer-const': 'error',
      'require-await': 'error',
      'yoda': 'error'
    }
  },

  // Vue 特定规则
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser
      }
    },
    rules: {
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-setup-props-reactivity-rules': 'off'
    }
  },

  // TypeScript 特定规则
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  },

  // 忽略文件
  {
    ignores: [
      'node_modules',
      'dist',
      'public',
      '.vscode/**',
      'src/assets/**',
      '**/*.min.js',
      'coverage/**'
    ]
  },

  // Prettier 配置 - 自动禁用冲突规则
  eslintPluginPrettierRecommended
]
