import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '../../app/page';

// fetch をモック
const mockFetch = vi.fn();

describe('Home Page', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('初期状態でローディング表示される', () => {
    // Arrange
    mockFetch.mockImplementation((url: string) => {
      // Mock MenuPhotoUpload's fetch to /api/menu-photos
      if (url === '/api/menu-photos') {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        } as Response);
      }
      // Mock the /api/chat endpoint to never resolve (for loading state)
      return new Promise(() => {
        // Never resolves - for testing loading state
      });
    });

    // Act
    render(<Home />);

    // Assert
    expect(screen.getByText('AI が応答を生成中です...')).toBeInTheDocument();
  });

  it('API成功時にreplyが表示される', async () => {
    // Arrange
    const mockReply = 'Hello from AI!';
    mockFetch
      .mockReturnValueOnce(
        // First call: MenuPhotoUpload fetches photos
        Promise.resolve({
          ok: true,
          json: async () => [],
        } as Response)
      )
      .mockReturnValueOnce(
        // Second call: Home component fetches chat
        Promise.resolve({
          ok: true,
          json: async () => ({ reply: mockReply }),
        } as Response)
      );

    // Act
    render(<Home />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('AI 応答:')).toBeInTheDocument();
      expect(screen.getByText(mockReply)).toBeInTheDocument();
    });
  });

  it('API失敗時にエラーメッセージが表示される', async () => {
    // Arrange
    mockFetch
      .mockReturnValueOnce(
        // First call: MenuPhotoUpload fetches photos
        Promise.resolve({
          ok: true,
          json: async () => [],
        } as Response)
      )
      .mockReturnValueOnce(
        // Second call: Home component chat fetch fails
        Promise.reject(new Error('Network error'))
      );

    // Act
    render(<Home />);

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText('Error: Failed to get response from AI')
      ).toBeInTheDocument();
    });
  });

  it('fetchが正しいパラメータで呼ばれる', async () => {
    // Arrange
    mockFetch
      .mockReturnValueOnce(
        // First call: MenuPhotoUpload fetches photos
        Promise.resolve({
          ok: true,
          json: async () => [],
        } as Response)
      )
      .mockReturnValueOnce(
        // Second call: Home component fetches chat
        Promise.resolve({
          ok: true,
          json: async () => ({ reply: 'test reply' }),
        } as Response)
      );

    // Act
    render(<Home />);

    // Assert
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'hello world' }),
      });
    });
  });
});
