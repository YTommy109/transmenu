import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MenuPhotoUpload } from './MenuPhotoUpload';

describe('MenuPhotoUpload', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('コンポーネントが正しくレンダリングされる', () => {
    render(<MenuPhotoUpload />);

    expect(
      screen.getByRole('heading', { name: 'メニュー写真をアップロード' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '保存済み画像' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'アップロード' })
    ).toBeInTheDocument();
  });

  it('初期状態では画像一覧が空である', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<MenuPhotoUpload />);

    await waitFor(() => {
      expect(
        screen.getByText('まだ画像がアップロードされていません')
      ).toBeInTheDocument();
    });
  });

  it('ファイルを選択するとプレビューが表示される', async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<MenuPhotoUpload />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByAltText('プレビュー')).toBeInTheDocument();
    });
  });

  it('ファイルが未選択の場合、アップロードボタンが無効である', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<MenuPhotoUpload />);

    const button = screen.getByRole('button', { name: 'アップロード' });
    expect(button).toBeDisabled();
  });

  it('アップロード失敗時にエラーメッセージが表示される', async () => {
    const user = userEvent.setup();

    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'アップロードに失敗しました' }),
      } as Response);

    render(<MenuPhotoUpload />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    await user.upload(input, file);

    const button = screen.getByRole('button', { name: 'アップロード' });
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByText('アップロードに失敗しました')
      ).toBeInTheDocument();
    });
  });

  it('保存済み画像が一覧表示される', async () => {
    const mockPhotos = [
      { id: 1, filename: 'photo1.jpg', createdAt: '2024-01-01' },
      { id: 2, filename: 'photo2.jpg', createdAt: '2024-01-02' },
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPhotos,
    } as Response);

    render(<MenuPhotoUpload />);

    await waitFor(() => {
      expect(screen.getByText('photo1.jpg')).toBeInTheDocument();
      expect(screen.getByText('photo2.jpg')).toBeInTheDocument();
    });
  });

  it('アップロード中はボタンが無効化される', async () => {
    const user = userEvent.setup();

    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({ id: 1 }),
              } as Response);
            }, 100);
          })
      );

    render(<MenuPhotoUpload />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    await user.upload(input, file);

    const button = screen.getByRole('button', { name: 'アップロード' });
    await user.click(button);

    expect(
      screen.getByRole('button', { name: 'アップロード中...' })
    ).toBeDisabled();
  });
});
