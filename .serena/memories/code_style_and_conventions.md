# コードスタイルと設計指針

- FSD に基づく依存方向を強制: `app → widgets → features → entities → shared`。上位レイヤからのみパスエイリアス（例: `@/...`）を使い、下位レイヤは相対パス参照で閉じる。
- ディレクトリごとに公開 API を `index.ts` 等で絞り込む。サーバー専用エントリには `'use server'` を明記し、クライアント側は `'use client'` で区別。DI は factory/`depend` を介して注入。
- JSX は最小限かつセマンティックに保ち、Tailwind CSS 4 のユーティリティと `globals.css` のカスタムレイヤでスタイルを拡張。新規トークンは `globals.css` に追加。
- TypeScript を全面採用し、型・Zod スキーマは entity model に配置。feature model ではユースケースロジックをサービスとして組み、非同期処理は `async`/`await` で統一。
- コードは ASCII ベースで記述し、意味のある箇所にのみ短いコメントを付ける。不要なコンソール出力やデバッグコードはコミットしない。
- ESLint は `next/core-web-vitals` と `next/typescript` を継承。フォーマッタは未導入だが、ESLint のフォーマット規約に従う。
