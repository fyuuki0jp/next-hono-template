# Drizzle Kit 導入タスク

- [x] drizzle-kit を devDependencies に追加し、postgres を runtime 依存として追加する
- [x] package.json の scripts に drizzle-kit コマンド (db:generate, db:migrate, db:push など) を追加する
- [x] drizzle.config.ts を作成し、開発時は PGlite、その他は PostgreSQL を参照するよう環境変数ベースで設定する
- [x] src/shared/db/client.ts を環境変数で PGlite と PostgreSQL を切り替えられるよう修正し、初期化ロジックを整理する
- [x] README.md に drizzle-kit の利用手順と環境変数設定のガイドを追記する