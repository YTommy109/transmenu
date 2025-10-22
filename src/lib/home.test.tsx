import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../../app/page';

// fetch をモック
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('初期状態でローディング表示される', () => {
    // Arrange
    mockFetch.mockImplementation(() => 
      new Promise(() => {
        // Never resolves - for testing loading state
      })
    );

    // Act
    render(<Home />);

    // Assert
    expect(screen.getByText('AI が応答を生成中です...')).toBeInTheDocument();
  });

  it('API成功時にreplyが表示される', async () => {
    // Arrange
    const mockReply = 'Hello from AI!';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: mockReply }),
    });

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
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    // Act
    render(<Home />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to get response from AI')).toBeInTheDocument();
    });
  });

  it('fetchが正しいパラメータで呼ばれる', async () => {
    // Arrange
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'test reply' }),
    });

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