# テスト戦略

## 現在の構成

### ✅ 実装済み

- **ユニットテスト**: Vitestで`node`環境（ユーティリティ関数用）
- **E2Eテスト**: Playwrightで完全なユーザーフロー
- **co-locationスタイル**: テストファイルを実装ファイルと同じディレクトリに配置

### ❌ 現在の制限

- **Reactコンポーネントテスト**: jsdom互換性問題により無効化
  - `vitest.config.ts`で`**/components/**/*.test.{ts,tsx}`を除外中

## 将来の改善計画

### オプション1: jsdom問題の解決

```bash
# 依存関係の更新とjsdom互換性修正
pnpm update jsdom vitest @vitest/ui
```

### オプション2: Jest + React Testing Libraryの追加

```bash
# React専用テスト環境の構築
pnpm add -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### オプション3: Playwright Component Testing

```bash
# Playwright実験的コンポーネントテスト機能
pnpm add -D @playwright/experimental-ct-react
```

## 推奨アプローチ

現在の構成で十分な理由：

1. **ユーティリティロジック** → Vitestユニットテスト
2. **UIインタラクション** → PlaywrightE2Eテスト
3. **型安全性** → TypeScript静的チェック

## テストカバレッジ

| 領域 | ツール | 対象 |
|------|--------|------|
| ビジネスロジック | Vitest | `src/lib/**` |
| UIコンポーネント | Playwright | E2Eシナリオ |
| 型チェック | TypeScript | 全ファイル |
