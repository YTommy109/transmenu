import { expect, test } from '@playwright/test';

const createTestImageBuffer = () =>
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

test.describe('メニュー写真アップロード機能', () => {
  test('メニュー写真アップロードの完全フロー', async ({ page }) => {
    // Given: 初期表示の確認
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'メニュー写真をアップロード' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '保存済み画像' })
    ).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    await expect(fileInput).toHaveAttribute(
      'accept',
      'image/jpeg,image/png,image/webp'
    );

    const uploadButton = page.getByRole('button', { name: 'アップロード' });
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toBeDisabled();

    // When: ファイルを選択
    const buffer = createTestImageBuffer();
    await fileInput.setInputFiles({
      name: 'e2e-test-complete-flow.png',
      mimeType: 'image/png',
      buffer,
    });

    // Then: プレビュー表示とボタン有効化
    await expect(page.getByAltText('プレビュー')).toBeVisible();
    await expect(uploadButton).toBeEnabled();

    // When: アップロード実行
    await uploadButton.click();

    // Then: アップロード中の表示
    await expect(
      page.getByRole('button', { name: 'アップロード中...' })
    ).toBeDisabled();

    // Then: アップロード完了後の状態確認
    await expect(page.getByAltText('プレビュー')).not.toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByText('e2e-test-complete-flow.png').first()
    ).toBeVisible({ timeout: 10_000 });

    // When: ページリロード
    await page.reload();

    // Then: 永続化確認
    await expect(
      page.getByText('e2e-test-complete-flow.png').first()
    ).toBeVisible();
    await expect(
      page.getByText('まだ画像がアップロードされていません')
    ).not.toBeVisible();
  });

  test('複数の画像を連続でアップロードできる', async ({ page }) => {
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');
    const buffer = createTestImageBuffer();

    // 1枚目をアップロード
    await fileInput.setInputFiles({
      name: 'multi-test-1.png',
      mimeType: 'image/png',
      buffer,
    });
    const uploadButton1 = page.getByRole('button', { name: 'アップロード' });
    await uploadButton1.click();
    await expect(page.getByText('multi-test-1.png').first()).toBeVisible({
      timeout: 10_000,
    });

    // 2枚目をアップロード（ファイル入力が再度有効になるまで待つ）
    await expect(fileInput).toBeEnabled({ timeout: 5000 });
    await fileInput.setInputFiles({
      name: 'multi-test-2.png',
      mimeType: 'image/png',
      buffer,
    });
    // プレビューが表示されることを確認（ファイルが正しく選択されたことの証明）
    await expect(page.getByAltText('プレビュー')).toBeVisible({
      timeout: 5000,
    });
    const uploadButton2 = page.getByRole('button', { name: 'アップロード' });
    await expect(uploadButton2).toBeEnabled({ timeout: 5000 });
    await uploadButton2.click();
    await expect(page.getByText('multi-test-2.png').first()).toBeVisible({
      timeout: 10_000,
    });

    // 両方が表示されていることを確認
    await expect(page.getByText('multi-test-1.png').first()).toBeVisible();
    await expect(page.getByText('multi-test-2.png').first()).toBeVisible();
  });

  test('JPEG形式の画像をアップロードできる', async ({ page }) => {
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');
    const uploadButton = page.getByRole('button', { name: 'アップロード' });

    const jpegBuffer = Buffer.from(
      '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==',
      'base64'
    );

    await fileInput.setInputFiles({
      name: 'format-test.jpg',
      mimeType: 'image/jpeg',
      buffer: jpegBuffer,
    });
    await uploadButton.click();

    await expect(page.getByText('format-test.jpg').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('OCRボタンのクリックからテキスト抽出までのフロー', async ({
    page,
  }) => {
    // Given: 画像をアップロード
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');
    const buffer = createTestImageBuffer();

    await fileInput.setInputFiles({
      name: 'ocr-test.png',
      mimeType: 'image/png',
      buffer,
    });

    const uploadButton = page.getByRole('button', { name: 'アップロード' });
    await uploadButton.click();

    // アップロード完了を待つ
    await expect(page.getByText('ocr-test.png').first()).toBeVisible({
      timeout: 10_000,
    });

    // When: OCRボタンをクリック
    const ocrButton = page.getByRole('button', { name: 'OCR' }).first();
    await expect(ocrButton).toBeVisible();
    await ocrButton.click();

    // Then: 処理中の表示
    await expect(
      page.getByRole('button', { name: '処理中...' }).first()
    ).toBeVisible({ timeout: 5000 });

    // Then: 抽出されたテキストが表示される（またはエラーメッセージ）
    // 注意: OpenAI APIのモックがないため、実際のAPI呼び出しが発生する可能性がある
    // タイムアウトを長めに設定
    await expect(
      page.getByRole('heading', { name: '抽出されたテキスト' }).or(
        page.getByText(/OCR処理中にエラー/)
      )
    ).toBeVisible({ timeout: 30_000 });
  });
});
