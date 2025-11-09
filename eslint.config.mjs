import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import nextConfig from 'eslint-config-next'
import boundaries from 'eslint-plugin-boundaries'
import eslintConfigPrettier from 'eslint-config-prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const [baseConfig, ...restConfigs] = nextConfig

const boundarySettings = {
  'boundaries/root-path': resolve(__dirname, 'src'),
  'boundaries/elements': [
    { type: 'shared', pattern: 'shared/**' },
    { type: 'entities', pattern: 'entities/**' },
    { type: 'features', pattern: 'features/**' },
    { type: 'widgets', pattern: 'widgets/**' },
    { type: 'app', pattern: 'app/**' }
  ],
  'boundaries/ignore': ['**/@x/**']
}

const withBoundaries = {
  ...baseConfig,
  plugins: {
    ...baseConfig.plugins,
    boundaries
  },
  settings: {
    ...(baseConfig.settings ?? {}),
    ...boundarySettings,
    'import/resolver': {
      ...(baseConfig.settings?.['import/resolver'] ?? {}),
      typescript: {
        project: ['tsconfig.json'],
        alwaysTryTypes: true
      }
    }
  },
  rules: {
    ...(baseConfig.rules ?? {}),
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          { from: 'shared', allow: ['shared'] },
          { from: 'entities', allow: ['shared'] },
          { from: 'features', allow: ['entities', 'shared'] },
          { from: 'widgets', allow: ['features', 'entities', 'shared'] },
          { from: 'app', allow: ['widgets', 'features', 'entities', 'shared'] }
        ]
      }
    ]
  }
}

const config = [withBoundaries, ...restConfigs, { rules: eslintConfigPrettier.rules }]

export default config
