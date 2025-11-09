# タスク完了時の確認事項

- 依存追加や初回セットアップ後は `pnpm install` を実行し、`pnpm lint` で静的解析を通過させる。
- ユースケースや API を変更した場合は Next.js App Router のサーバー／クライアント境界を再確認し、`features` と `entities` の公開 API を更新。
- Tailwind 利用部分は `globals.css` のトークンや `@layer` 拡張が破綻していないか確認し、必要ならローカルで `pnpm dev` を起動して UI を目視確認。
- ビルド互換性が不安な変更では `pnpm build` を実行して SSR/静的出力が成功するか確認。
- 変更点を説明できる状態にし、関連するメモリ／ドキュメントを更新済みか最終確認。
