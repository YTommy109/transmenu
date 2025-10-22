import { expect, test } from '@playwright/test';

test('ホームページにHello Worldタイトルが表示される', async ({ page }) => {
  // Given
  await page.goto('/');

  // When & Then
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Hello World'
  );
});

test('ホームページに説明文が表示される', async ({ page }) => {
  // Given
  await page.goto('/');

  // When & Then
  await expect(page.getByText(/Welcome to TransMenu/)).toBeVisible();
});

test('ホームページのタイトルが正しく設定される', async ({ page }) => {
  // Given
  await page.goto('/');

  // When & Then
  await expect(page).toHaveTitle(/TransMenu/);
});

test('AI応答エリアが表示される', async ({ page }) => {
  // Given
  await page.goto('/');

  // Then
  const responseArea = page.locator('div').filter({ hasText: /AI が応答を生成中です/ });
  await expect(responseArea).toBeVisible();
});

test('自動実行でOpenAI応答が表示される', async ({ page }) => {
  // Given
  await page.goto('/');

  // When - 自動実行されるので待機
  // Then
  const responseElement = page.getByTestId('ai-response');
  await expect(responseElement).toBeVisible({ timeout: 15_000 });
});

test('OpenAI応答が空でない', async ({ page }) => {
  // Given
  await page.goto('/');

  // When - 自動実行されるので待機
  const responseElement = page.getByTestId('ai-response');
  await expect(responseElement).toBeVisible({ timeout: 15_000 });
  const responseText = await responseElement.textContent();

  // Then
  expect(responseText).toBeTruthy();
  expect(responseText?.trim().length).toBeGreaterThan(0);
});
