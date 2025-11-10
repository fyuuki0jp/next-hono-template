import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// グローバル環境変数の設定
process.env.DRIZZLE_USE_PGLITE = 'true'
process.env.PGLITE_DATA_PATH = 'memory://'

// 各テスト後にクリーンアップ
afterEach(() => {
  cleanup()
})
