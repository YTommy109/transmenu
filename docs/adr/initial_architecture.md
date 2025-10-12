# ADR-001: TransMenu 初期アーキテクチャ決定

## ステータス

採用済み

## 決定日

2025-10-12

## 背景

TransMenuプロジェクトは、個人飲食店が外国人観光客用の多言語メニューを簡単に提供できるサービスです。以下の段階的開発を予定しています：

### Phase 1: メニュー写真から英語メニューを作成

- スマホカメラでメニュー撮影
- AI OCRでテキスト抽出
- LLMで英語翻訳

### Phase 2: 店舗識別システム

- 店舗登録と個別ID発行
- 店舗専用ページ作成
- QRコード生成・配布

### Phase 3: メニュー編集機能

- OCR結果・翻訳結果の編集
- 店舗管理画面と顧客向け画面の分離

## 決定事項

### 採用技術スタック

| カテゴリ | 採用技術 | 理由 |
|---------|---------|------|
| **フロントエンド** | Next.js 14 (App Router) | SSR/SSG対応、店舗別ルーティング、モバイル最適化 |
| **スタイリング** | Emotion (CSS-in-JS) | LLMとの協調開発、TypeScript統合、動的スタイリング |
| **データベース** | PostgreSQL | JSON対応、Full-text Search、スケーラビリティ |
| **ORM** | Drizzle | 型安全性、軽量、Edge対応 |
| **AI処理** | LangChain + OpenAI API | Vision API、日本語対応、実績 |
| **ホスティング** | Vercel | Next.js最適化、環境変数管理、画像最適化 |
| **ユニットテスト** | Vitest | 高速、ESM対応、TypeScript統合 |
| **E2Eテスト** | Playwright | マルチブラウザ、モバイル対応、視覚的テスト |

## 各技術の詳細決定理由

### フロントエンド: Next.js 14

**採用理由:**

- SEO対応が重要な店舗ページに最適なSSR/SSG
- Image Optimizationでメニュー写真を最適化
- App Routerで店舗別ルーティング (`/store/[storeId]`) が簡潔
- API Routesで同一プロジェクト内にAI処理エンドポイント作成

**代替案検討:**

- Remix: SSRに強いがVercelとの統合でNext.jsに劣る
- SvelteKit: 軽量だがエコシステムでNext.jsに劣る

### スタイリング: Emotion

**採用理由:**

- **LLM協調**: JSX内直接記述でAIが理解しやすい
- **開発効率**: TypeScript完全対応、propsベース動的スタイリング
- **TransMenu要件**: 店舗別テーマ、翻訳状態表示に最適
- **パフォーマンス**: Styled Componentsより軽量

**代替案検討:**

- Tailwind CSS: 開発は高速だがクラス名記憶がLLMに負担、カスタムデザイン制限
- Pure CSS: LLM理解度高いがTypeScript連携・動的スタイルが困難
- Styled Components: 良いがEmotionの方が軽量でSSR対応

### データベース: PostgreSQL + Drizzle

**採用理由:**

- **PostgreSQL**: JSON対応、Full-text Search、Vercel Postgres統合
- **Drizzle**: 型安全性、軽量でEdge対応、SQLライクな記述

**スキーマ設計例:**

```typescript
export const stores = pgTable('stores', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  qrCode: varchar('qr_code', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const menus = pgTable('menus', {
  id: uuid('id').primaryKey().defaultRandom(),
  storeId: uuid('store_id').references(() => stores.id),
  originalImageUrl: varchar('original_image_url', { length: 500 }),
  extractedText: text('extracted_text'),
  translatedText: text('translated_text'),
  aiProcessingMeta: json('ai_processing_meta'),
  status: varchar('status', { length: 50 }).default('processing'),
});
```

### AI処理: LangChain + OpenAI API

**採用理由:**

- **シンプル化**: Gemini除外でOpenAIに集約
- **実績**: 商用プロダクトでの豊富な実績
- **Vision API**: GPT-4 Visionの高精度画像認識
- **日本語対応**: メニュー文字認識・翻訳品質が優秀

**実装方針:**

```typescript
// シンプルなOpenAI API直接呼び出し
const response = await openai.chat.completions.create({
  model: "gpt-4-vision-preview",
  messages: [{
    role: "user",
    content: [
      { type: "text", text: "日本語メニューを抽出・英語翻訳" },
      { type: "image_url", image_url: { url: imageUrl } }
    ]
  }]
});
```

### 店舗識別子: Sqids

**採用理由:**

- **URL最適化**: UUIDより大幅に短い（36文字 → 6文字程度）
- **ユーザー体験**: 覚えやすく、口頭での伝達も可能
- **QRコード最適化**: 短縮URLでQRコードがシンプルになる
- **セキュリティ**: 店舗数の推測を防ぎ、連続性を隠蔽
- **URL安全性**: 不適切な単語を自動回避、URL安全文字のみ使用

**スキーマ更新:**

```typescript
export const stores = pgTable('stores', {
  id: serial('id').primaryKey(), // 内部用数値ID
  sqid: varchar('sqid', { length: 20 }).unique().notNull(), // 公開用識別子
  name: varchar('name', { length: 255 }).notNull(),
  qrCode: varchar('qr_code', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**実装例:**

```typescript
// 店舗登録時
import { Sqids } from 'sqids';
const sqids = new Sqids();

const newStore = await db.insert(stores).values({
  name: storeName,
}).returning();

const sqid = sqids.encode([newStore.id]);
await db.update(stores).set({ sqid }).where(eq(stores.id, newStore.id));

// URL生成
const storeUrl = `https://transmenu.com/store/${sqid}`; // 例: /store/Lqj8a0
```

**Next.js Dynamic Routing:**

```typescript
// app/store/[storeId]/page.tsx
export default async function StorePage({ 
  params 
}: { 
  params: { storeId: string } 
}) {
  const sqids = new Sqids();
  const numericId = sqids.decode(params.storeId)[0];
  
  const store = await db.select()
    .from(stores)
    .where(eq(stores.id, numericId))
    .limit(1);
}
```

### テスト戦略

**テストピラミッド:**

```text
E2E (Playwright)     ← 少数、重要フロー
  ├── アップロード〜翻訳完了
  ├── 店舗ページ〜QRコード生成
  └── モバイル・デスクトップ確認

Integration (Vitest)  ← 中程度
  ├── OpenAI API連携
  ├── DB操作
  └── API Routes

Unit (Vitest)        ← 多数、細かい処理
  ├── コンポーネント
  ├── ユーティリティ
  └── バリデーション
```

## 段階的実装計画

### Phase 1: MVP構築

```bash
技術構成:
├── Next.js 14 (App Router)
├── Emotion (CSS-in-JS) 
├── Drizzle + PostgreSQL
├── OpenAI API (直接呼び出し)
├── Vitest + Playwright
└── Vercel
```

**重点開発項目:**

1. メニュー画像アップロード機能
2. OpenAI Vision API によるOCR + 翻訳
3. 結果表示UI (Emotion)
4. PostgreSQLデータ保存

### Phase 2: 店舗管理

```bash
追加技術:
├── NextAuth.js (認証)
├── QRコード生成ライブラリ
├── Vercel Blob (画像ストレージ)
└── 店舗管理UI
```

### Phase 3: 本格運用

```bash
スケーリング:
├── Redis (キャッシュ)
├── Vercel Analytics (監視)
├── Sentry (エラー追跡)
└── パフォーマンス最適化
```

## 除外した技術・理由

| 技術 | 除外理由 |
|-----|---------|
| **Hono** | Phase 1はNext.js API Routesで十分、複雑化回避 |
| **Gemini** | OpenAI APIに集約、実績重視 |
| **Tailwind CSS** | LLMとの協調でクラス名記憶が負担、カスタマイズ制限 |
| **Prisma** | Drizzleの方がEdge対応・軽量 |

## 実装開始手順

### 1. プロジェクト初期化

```bash
npx create-next-app@latest transmenu --typescript --tailwind --eslint --app
cd transmenu
```

### 2. 依存関係インストール

```bash
# データベース
npm install drizzle-orm @vercel/postgres
npm install -D drizzle-kit

# AI処理
npm install openai

# スタイリング
npm install @emotion/react @emotion/styled
npm install -D @emotion/babel-plugin

# テスト
npm install -D vitest @testing-library/react jsdom
npm install -D @playwright/test
npx playwright install
```

### 3. 設定ファイル

```typescript
// next.config.js
const nextConfig = {
  compiler: {
    emotion: true,
  },
}

// .env.local
OPENAI_API_KEY=your_openai_api_key
POSTGRES_URL=your_vercel_postgres_url
```

## 影響・リスク

### ポジティブな影響

- LLMとの協調開発による高い生産性
- TypeScript統合による型安全性
- Next.js + Vercelによる高いパフォーマンス
- 段階的開発による低リスク

### 考慮すべきリスク

- OpenAI APIコスト（使用量監視必要）
- 新技術（Drizzle、Emotion）の学習コスト
- AI処理の精度・速度（品質テスト重要）

## 測定指標

### 技術指標

- ページロード速度 < 2秒
- AI処理時間 < 10秒
- テストカバレッジ > 80%

### ビジネス指標  

- メニュー翻訳精度 > 90%
- ユーザー満足度 > 4.0/5.0
- 店舗利用継続率 > 70%

## レビュー予定

- Phase 1完了時: 技術選定の妥当性確認
- Phase 2開始前: スケーリング対応の検討
- 正式リリース前: 全体アーキテクチャの最終評価
