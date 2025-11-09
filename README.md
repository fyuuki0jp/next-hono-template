# Next Hono Template

Next.js 16（App Router）と Hono + Drizzle ORM を組み合わせたフルスタックのひな形です。  
`src/app/api/[...route]/route.ts` に Hono で書かれた API をホストしつつ、Next.js のページから `hono/client` を使ってその API にアクセスする構成になっています。  
現在のサンプルは挨拶メッセージをデータベースから取得する `greeting` 機能で、Velona を使った依存性注入、Drizzle の Repository/Service 層、Hono のルート定義といった実践的な構成が含まれています。

## 構成ガイド
- `src/app`：Next.js のルート（ページ、レイアウト、API）。
- `src/app/api/[...route]/route.ts`：Hono アプリを `/api` にマウントし、`/hello` ルートで挨拶 API を公開。
- `src/features/greeting`：UI → hook → service → repository と流れを分離したドメイン設計。
- `src/entities/greeting`：データベーススキーマやモデル変換。
- `src/shared/db`：Drizzle のスキーマ定義と `PGlite/Postgres` の接続ラッパー。
- `src/shared/di`：Velona で DB クライアントを提供する DI コンテナ。

## セットアップ
1. `pnpm install` で依存関係をインストール。
2. `.env.development.local` などに環境変数を定義（後述）。
3. `pnpm dev` で Next.js 開発サーバを起動。

## 主要なスクリプト
| コマンド | 説明 |
| --- | --- |
| `pnpm dev` | 開発サーバ（Next + Hono の統合）を起動。 |
| `pnpm build` | 本番ビルド（Next.js サイト + Hono ルートを含む）を作成。 |
| `pnpm start` | ビルド済みアプリを起動。 |
| `pnpm lint` | ESLint による静的解析。 |
| `pnpm format` / `pnpm format:check` | Prettier でコードフォーマット。 |
| `pnpm db:generate` | Drizzle Kit でスキーマからマイグレーション (`schema` → `drizzle.config.ts` など) を生成。 |
| `pnpm db:migrate` | `drizzle-kit` による SQL マイグレーションの適用。 |
| `pnpm db:push` | スキーマを直接指定先データベースに反映。 |
| `pnpm db:seed` | `scripts/seed.ts` を実行し、`greetings` テーブルに初期データを投入。 |

## データベースと API
- `src/shared/db/schema.ts` で `greetings` テーブルを定義。
- Drizzle + Velona で `GreetingRepository`、`GreetingService` を構成し、`/api/hello` から最新の挨拶を返却。
- `scripts/seed.ts` で `greetings` テーブルにサンプルメッセージを入れておくことで、API のレスポンスが空にならない。
- データベースクライアントは `DRIZZLE_USE_PGLITE` や `DATABASE_URL` に応じて PGlite/Postgres を切り替える。

## 環境変数
| 変数 | 説明 | デフォルト / 備考 |
| --- | --- | --- |
| `DRIZZLE_USE_PGLITE` | `true`/`1` で PGlite を強制、`false`/`0` で PostgreSQL を強制 | 開発モードかつ `DATABASE_URL` 未定義なら自動的に PGlite を使う |
| `PGLITE_DATA_PATH` | PGlite のファイルパス | `<repo>/.local/pglite.dev.db` |
| `DATABASE_URL` | PostgreSQL 接続文字列 | PGlite 利用時は不要。Postgres ルートなら必須。 |
| `PG_MAX_CONNECTIONS` | Postgres.js のプール最大接続数 | `10` |
| `PG_SSL` | `true`/`1` で SSL 接続を有効化 | デフォルトは無効 |
| `NODE_ENV` | Next/Hono の実行モード（`development`/`production`） | Next の規約通り、production では PGlite 禁止。 |

本番環境では `DATABASE_URL`（+`PG_SSL` など）を明示的に提供し、開発では `.env.development.local` で `DRIZZLE_USE_PGLITE=true` などを設定すると手早く構築できます。

`pnpm db:seed` はマイグレーション後に一度だけ実行すれば、`GET /api/hello` が `greeting` 文字列を返す状態になります。
