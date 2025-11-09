# Feature Slice リファレンス

- API レイヤ: `app/api/[...route]/route.ts` で共通 `Hono` インスタンスに機能ルータをぶら下げる。サンプルの `features/greeting/api/hono-router.ts` のように、HTTP ハンドラ内でサービスを解決し、Payload は `{ entityKey }` 形式で返す。
- サーバーエントリ: 各 feature の `server/index.ts` は `'use server'` を付けたコンテナや Factory を再エクスポートし、App Router のサーバーコンポーネントから利用可能にする（例: `GreetingContainer`）。
- DI チェーン: `velona.depend` で下位レイヤの Factory を束ねる。`feature model factory → entity repository factory → shared/di/container.ts` の順で依存解決し、非同期初期化（DB 準備など）を透過的に扱う。
- ドメインモデル: `entities/<domain>/model` に Zod スキーマと `parse`/`fromRow` を置き、API/DB からの入力を検証する。サービス層やフックはこのパーサーを通じて型安全性を担保する。
- クライアント側: `'use client'` な UI/Hook は React Query などの状態管理を担当。初期データと API Fetcher を受け取り、`queryKey` を含む共通パターン (`useGreeting` 参照) で再利用性を保つ。
- API クライアント: `features/<feature>/api/factory.ts` で `hc<FeatureApiType>` を生成し、メソッド名ベースの fetcher マップを返す。DI で `createClient` を差し替え可能にして、テストや別環境への適用を簡易化する。
- データアクセス: `shared/db/schema.ts` にテーブル、`shared/db/client.ts` に Drizzle/PGlite クライアントを定義。`prepareDatabase()` パターンでマイグレーション不要のシードを実現する。

## サンプル実装抜粋

### API ルータ (`features/greeting/api/hono-router.ts`)

```ts
import { Hono } from 'hono'

import { greetingServiceFactory } from '../model/factory'

export const greetingApi = new Hono().get('/', async (c) => {
  const service = await greetingServiceFactory()
  const greeting = await service.getGreeting()

  return c.json({ greeting })
})

export type GreetingApiType = typeof greetingApi
```

### サービスファクトリ (`features/greeting/model/factory.ts`)

```ts
import { depend } from 'velona'

import { greetingRepositoryFactory } from '@/entities/greeting/api/factory'
import { createGreetingService } from './service'

export const greetingServiceFactory = depend(
  { repository: greetingRepositoryFactory },
  async ({ repository }) => {
    const repo = await repository()
    return createGreetingService(repo)
  }
)

export type GreetingServiceFactory = typeof greetingServiceFactory
```

### リポジトリ (`entities/greeting/api/repository.ts`)

```ts
import { desc } from 'drizzle-orm'

import type { DbClient } from '../../../shared/db/client'
import { greetings } from '../../../shared/db/schema'
import { fromRow, type GreetingModel } from '@/entities/greeting/model/greeting'

export interface GreetingRepository {
  getLatest(): Promise<GreetingModel>
}

export const createGreetingRepository = (db: DbClient): GreetingRepository => ({
  async getLatest() {
    const [row] = await db.select().from(greetings).orderBy(desc(greetings.id)).limit(1)

    if (!row) {
      throw new Error('Greeting not found')
    }

    return fromRow(row)
  }
})
```

### クライアントフック (`features/greeting/hook/useGreeting.ts`)

```ts
'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { parseGreeting, type GreetingModel } from '@/entities/greeting/model/greeting'
import { createGreetingApiFetchers, type GreetingApiKey } from '../api/factory'

type UseGreetingOptions = {
  initialGreeting: GreetingModel
  apiBaseUrl: string
  apiKey?: GreetingApiKey
}

export const useGreeting = ({
  initialGreeting,
  apiBaseUrl,
  apiKey = 'hello'
}: UseGreetingOptions) => {
  const fetchers = useMemo(() => createGreetingApiFetchers({ baseUrl: apiBaseUrl }), [apiBaseUrl])
  const contextualFetcher = fetchers[apiKey]

  if (!contextualFetcher) {
    throw new Error('Greeting API fetcher が解決できませんでした')
  }

  const { data, refetch, isPending } = useQuery<GreetingModel>({
    queryKey: ['greeting', apiKey, apiBaseUrl],
    queryFn: async () => {
      const response = await contextualFetcher()
      const payload = await response.json()
      return parseGreeting(payload.greeting)
    },
    initialData: initialGreeting
  })

  return {
    greeting: data,
    refresh: refetch,
    isPending
  }
}
```
