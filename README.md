## Setup

```
pnpm install
pnpm dev
```

## Drizzle Toolkit

- `pnpm db:generate` でスキーマからマイグレーションを生成
- `pnpm db:migrate` で SQL マイグレーションを適用
- `pnpm db:push` でスキーマを直接データベースへ反映
- `pnpm db:seed` で `greetings` テーブルへ初期データを投入

## 環境変数

| 変数 | 説明 | デフォルト |
| --- | --- | --- |
| `DRIZZLE_USE_PGLITE` | `true` / `1` で PGlite を強制、`false` / `0` で PostgreSQL を強制 | 開発環境かつ `DATABASE_URL` 未設定なら PGlite |
| `PGLITE_DATA_PATH` | PGlite のデータファイルパス | `<repo>/.local/pglite.dev.db` |
| `DATABASE_URL` | PostgreSQL 接続文字列 | PGlite 利用時は不要 / それ以外は必須 |
| `PG_MAX_CONNECTIONS` | Postgres.js のプール最大接続数 | `10` |
| `PG_SSL` | `true` / `1` で SSL を有効化 | 無効 |

開発では `.env.development.local` などで PGlite 用の値を設定し、
本番では `DATABASE_URL` など PostgreSQL 用の値を提供してください。

マイグレーション適用後に `pnpm db:seed` を実行すると、初回のみ挨拶メッセージが登録されます。
