import { expect, test } from '@playwright/test';

test.describe('メニュー写真アップロード機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('アップロードコンポーネントが表示される', async ({ page }) => {
    // Given & When
    await page.goto('/');

    // Then
    await expect(
      page.getByRole('heading', { name: 'メニュー写真をアップロード' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '保存済み画像' })
    ).toBeVisible();
  });

  test('ファイル選択入力が表示される', async ({ page }) => {
    // Given & When
    await page.goto('/');

    // Then
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    await expect(fileInput).toHaveAttribute(
      'accept',
      'image/jpeg,image/png,image/webp'
    );
  });

  test('アップロードボタンが初期状態で無効である', async ({ page }) => {
    // Given & When
    await page.goto('/');

    // Then
    const uploadButton = page.getByRole('button', { name: 'アップロード' });
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toBeDisabled();
  });

  test('ファイルを選択するとプレビューが表示される', async ({ page }) => {
    // Given
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');

    // When - テスト用の画像ファイルを作成してアップロード
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer,
    });

    // Then
    await expect(page.getByAltText('プレビュー')).toBeVisible();
  });

  test('ファイルを選択するとアップロードボタンが有効になる', async ({
    page,
  }) => {
    // Given
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');
    const uploadButton = page.getByRole('button', { name: 'アップロード' });

    // When
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer,
    });

    // Then
    await expect(uploadButton).toBeEnabled();
  });

  test('画像をアップロードできる', async ({ page }) => {
    // Given
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');
    const uploadButton = page.getByRole('button', { name: 'アップロード' });

    // When
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    await fileInput.setInputFiles({
      name: 'e2e-test-image.png',
      mimeType: 'image/png',
      buffer,
    });

    await uploadButton.click();

    // Then - アップロード中の表示を確認
    await expect(
      page.getByRole('button', { name: 'アップロード中...' })
    ).toBeVisible();

    // Then - アップロード完了後、保存済み画像一覧に表示される
    await expect(page.getByText('e2e-test-image.png').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('アップロード後、プレビューがクリアされる', async ({ page }) => {
    // Given
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');
    const uploadButton = page.getByRole('button', { name: 'アップロード' });

    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    await fileInput.setInputFiles({
      name: 'preview-test.png',
      mimeType: 'image/png',
      buffer,
    });

    // When
    await expect(page.getByAltText('プレビュー')).toBeVisible();
    await uploadButton.click();

    // Then - アップロード完了後、プレビューが消える
    await expect(page.getByAltText('プレビュー')).not.toBeVisible({
      timeout: 10_000,
    });
  });

  test('保存済み画像が一覧表示される', async ({ page }) => {
    // Given - 画像を1枚アップロード
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');
    const uploadButton = page.getByRole('button', { name: 'アップロード' });

    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    await fileInput.setInputFiles({
      name: 'list-test-image.png',
      mimeType: 'image/png',
      buffer,
    });
    await uploadButton.click();

    // When - ページをリロード
    await page.waitForTimeout(2000); // アップロード完了を待つ
    await page.reload();

    // Then - 保存済み画像が表示される
    await expect(page.getByText('list-test-image.png').first()).toBeVisible();
  });

  test('複数の画像をアップロードできる', async ({ page }) => {
    // Given
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');
    const uploadButton = page.getByRole('button', { name: 'アップロード' });

    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    // When - 1枚目をアップロード
    await fileInput.setInputFiles({
      name: 'multi-test-1.png',
      mimeType: 'image/png',
      buffer,
    });
    await uploadButton.click();
    await page.waitForTimeout(2000);

    // When - 2枚目をアップロード
    await fileInput.setInputFiles({
      name: 'multi-test-2.png',
      mimeType: 'image/png',
      buffer,
    });
    await uploadButton.click();
    await page.waitForTimeout(2000);

    // Then - 両方の画像が表示される
    await expect(page.getByText('multi-test-1.png').first()).toBeVisible();
    await expect(page.getByText('multi-test-2.png').first()).toBeVisible();
  });

  test('サポートされている画像形式をアップロードできる', async ({
    page,
  }) => {
    // Given
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');
    const uploadButton = page.getByRole('button', { name: 'アップロード' });

    // JPEG画像
    const jpegBuffer = Buffer.from(
      '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==',
      'base64'
    );

    // When - JPEG
    await fileInput.setInputFiles({
      name: 'format-test.jpg',
      mimeType: 'image/jpeg',
      buffer: jpegBuffer,
    });
    await uploadButton.click();

    // Then
    await expect(page.getByText('format-test.jpg').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('画像が初期状態でない場合、空メッセージが表示されない', async ({
    page,
  }) => {
    // Given - 画像を1枚アップロード
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');
    const uploadButton = page.getByRole('button', { name: 'アップロード' });

    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    await fileInput.setInputFiles({
      name: 'empty-msg-test.png',
      mimeType: 'image/png',
      buffer,
    });
    await uploadButton.click();
    await page.waitForTimeout(2000);

    // When
    await page.reload();

    // Then
    await expect(
      page.getByText('まだ画像がアップロードされていません')
    ).not.toBeVisible();
  });
});
