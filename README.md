# TransMenu

Next.js 14、TypeScript、Emotion、PostgreSQLで構築されたAI駆動のメニュー翻訳アプリケーション

## 🚀 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript
- **スタイリング**: Emotion (CSS-in-JS)
- **データベース**: PostgreSQL + Drizzle ORM
- **テスト**: Vitest (ユニット) + Playwright (E2E)
- **パッケージマネージャ**: pnpm
- **開発環境**: devbox

## 📋 必要な環境

- Node.js 24.x
- PostgreSQL 17.x
- devbox (開発環境用)

## 🛠️ 開発セットアップ

### 1. 環境のセットアップ

```bash
# devbox環境を有効化
devbox shell
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 開発サーバーの起動

```bash
pnpm dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で利用できます

## 🧪 テスト

### ユニットテスト (Vitest)

```bash
# ユニットテストを実行
pnpm test

# UIでテストを実行
pnpm test:ui

# カバレッジ付きでテストを実行
pnpm test:coverage
```

### E2Eテスト (Playwright)

```bash
# E2Eテストを実行
pnpm e2e

# UIモードでE2Eテストを実行
pnpm playwright test --ui
```

## 📝 利用可能なスクリプト

| スクリプト | 説明 |
|-----------|------|
| `pnpm dev` | 開発サーバーを起動 |
| `pnpm build` | 本番用ビルド |
| `pnpm start` | 本番サーバーを起動 |
| `pnpm lint` | Biomeリンターを実行 |
| `pnpm lint:fix` | Biomeリンターで自動修正 |
| `pnpm format` | Biomeフォーマッターで自動修正 |
| `pnpm format:check` | フォーマットチェック |
| `pnpm check` | Biome統合チェック |
| `pnpm check:fix` | Biome統合チェックで自動修正 |
| `pnpm test` | ユニットテストを実行 |
| `pnpm test:ui` | UIでユニットテストを実行 |
| `pnpm e2e` | E2Eテストを実行 |

## 🏗️ プロジェクト構造

```text
transmenu/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ホームページ
│   └── providers.tsx      # Emotionキャッシュプロバイダ
├── e2e/                   # E2Eテスト
│   └── hello-world.spec.ts
├── src/
│   ├── components/        # Reactコンポーネント
│   │   ├── Button.tsx
│   │   └── Button.test.tsx # co-locationテスト
│   ├── lib/              # ユーティリティと設定
│   │   ├── sum.ts
│   │   └── sum.test.ts    # co-locationテスト
│   └── test/             # テストセットアップ
├── docs/                 # ドキュメント
└── devbox.json          # 開発環境設定
```

## 🎯 開発環境の機能

このプロジェクトは以下で構成されています：

- ✅ App RouterのNext.js 14
- ✅ 厄格な設定のTypeScript
- ✅ CSS-in-JSのEmotion
- ✅ ユニットテスト用のVitest
- ✅ E2Eテスト用のPlaywright
- ✅ 高速リンター・フォーマッターBiome
- ✅ LLM自律コード修正対応ルール
- ✅ 環境管理用のdevbox

## 🔧 設定ファイル

- `next.config.mjs` - Next.js設定
- `tsconfig.json` - TypeScript設定
- `biome.jsonc` - Biomeリンター・フォーマッター設定
- `vitest.config.ts` - Vitestテスト設定
- `playwright.config.ts` - PlaywrightE2Eテスト設定
- `devbox.json` - 開発環境設定

## 📖 アーキテクチャ

詳細なシステムアーキテクチャ情報については [docs/architecture.md](docs/architecture.md) を参照してください。
