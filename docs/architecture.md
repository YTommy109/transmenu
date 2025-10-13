# TransMenu システムアーキテクチャ

## 1. システムアーキテクチャ全体像

### 1.1 主要コンポーネント

| コンポーネント | 役割 | 技術 |
|---------------|------|------|
| **フロントエンド** | ユーザーインターフェース | Next.js 14 + Emotion |
| **バックエンドAPI** | ビジネスロジック | Next.js API Routes |
| **AI処理エンジン** | OCR・翻訳処理 | OpenAI API (GPT-4 Vision) |
| **データベース** | データ永続化 | PostgreSQL + Drizzle ORM |
| **画像ストレージ** | メニュー画像保存 | Vercel Blob |
| **ホスティング** | アプリケーション実行基盤 | Vercel |

## 2. 技術スタック

| カテゴリ | 採用技術 |
|---------|-------|
| **フロントエンド** | Next.js 14 (App Router) |
| **スタイリング** | Emotion (CSS-in-JS) |
| **データベース** | PostgreSQL |
| **ORM** | Drizzle |
| **AI処理** | OpenAI API |
| **ホスティング** | Vercel |
| **ユニットテスト** | Vitest |
| **E2Eテスト** | Playwright |
| **店舗識別子** | Sqids |
