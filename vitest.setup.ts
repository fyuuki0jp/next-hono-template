import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// グローバル環境変数の設定
// Type assertion to bypass readonly restriction in type definitions
Object.assign(process.env, {
  DRIZZLE_USE_PGLITE: 'true',
  PGLITE_DATA_PATH: 'memory://'
})

// 各テスト後にクリーンアップ
afterEach(() => {
  cleanup()
})
