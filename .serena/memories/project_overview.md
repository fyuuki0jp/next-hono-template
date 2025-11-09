# プロジェクト概要

- Next.js 16 App Router を用いた最小構成のフロントエンドアプリ。React 19 と TypeScript で構築され、Tailwind CSS 4 を利用してスタイルを管理する。
- API 層は Hono を用いて `/app/api/[...route]/route.ts` で集約し、`hc<ApiSchema>` による型安全なクライアント呼び出しを採用。DI には `velona` と独自の factory パターンを利用する。
- データアクセスには Drizzle ORM と `@electric-sql/pglite` が入り、`shared/db` 以下でクライアント・スキーマを管理。
- FSD (Feature-Sliced Design) に沿ったレイヤ構成。`app`（Canvas/App）、`features`、`entities`、`shared` の順で依存し、各ディレクトリは `model`、`api`、`hook`、`ui` などを内包。機能単位で完結させ、公開面は `index.ts` などのエントリで制御する。
- 代表例として greeting 機能があり、feature レイヤの `model` でユースケースロジック、entity レイヤの `api` でリポジトリを組み立て、UI は `features/greeting/ui` や `entities/greeting/ui` に分離されている。
