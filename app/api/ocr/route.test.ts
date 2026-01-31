import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSelect = vi.fn();
const mockChatCompletionsCreate = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    select: mockSelect,
  },
}));

vi.mock('@/lib/db/schema', () => ({
  menuPhotos: {
    id: 'id',
    filename: 'filename',
    imageData: 'imageData',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value })),
}));

vi.mock('@/lib/openai', () => ({
  getOpenAIClient: vi.fn(() => ({
    chat: {
      completions: {
        create: mockChatCompletionsCreate,
      },
    },
  })),
  DEFAULT_MODEL: 'gpt-4o-mini',
}));

describe('POST /api/ocr', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('正常系: 画像IDを指定してOCR処理が成功する', async () => {
    const mockPhoto = {
      id: 1,
      filename: 'test.jpg',
      imageData: Buffer.from('test image data'),
    };

    const mockExtractedText = '抽出されたテキスト\n料理名: ハンバーガー\n価格: 500円';

    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPhoto]),
        }),
      }),
    });

    mockChatCompletionsCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: mockExtractedText,
          },
        },
      ],
    });

    const { POST } = await import('./route');
    const request = new Request('http://localhost:3000/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageId: 1 }),
    }) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.text).toBe(mockExtractedText);
    expect(mockChatCompletionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4o-mini',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.arrayContaining([
              expect.objectContaining({
                type: 'text',
                text: expect.stringContaining('テキストを抽出'),
              }),
              expect.objectContaining({
                type: 'image_url',
                image_url: expect.objectContaining({
                  url: expect.stringContaining('data:image/jpeg;base64,'),
                }),
              }),
            ]),
          }),
        ]),
      })
    );
  });

  it('異常系: imageIdが指定されていない場合、400エラーを返す', async () => {
    const { POST } = await import('./route');
    const request = new Request('http://localhost:3000/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('imageId is required');
  });

  it('異常系: 無効な画像ID（数値でない）を指定した場合、400エラーを返す', async () => {
    const { POST } = await import('./route');
    const request = new Request('http://localhost:3000/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageId: 'invalid' }),
    }) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('imageId must be a valid number');
  });

  it('異常系: 存在しない画像IDを指定した場合、404エラーを返す', async () => {
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const { POST } = await import('./route');
    const request = new Request('http://localhost:3000/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageId: 999 }),
    }) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('画像が見つかりません');
  });

  it('異常系: 無効なJSONリクエストボディの場合、400エラーを返す', async () => {
    const { POST } = await import('./route');
    const request = new Request('http://localhost:3000/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json',
    }) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid JSON in request body');
  });

  it('異常系: OpenAI APIエラー時のハンドリング', async () => {
    const mockPhoto = {
      id: 1,
      filename: 'test.jpg',
      imageData: Buffer.from('test image data'),
    };

    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPhoto]),
        }),
      }),
    });

    mockChatCompletionsCreate.mockRejectedValue(
      new Error('OpenAI API error')
    );

    const { POST } = await import('./route');
    const request = new Request('http://localhost:3000/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageId: 1 }),
    }) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('OCR処理中にエラーが発生しました');
  });

  it('異常系: OpenAI APIが空のレスポンスを返した場合、デフォルトメッセージを返す', async () => {
    const mockPhoto = {
      id: 1,
      filename: 'test.jpg',
      imageData: Buffer.from('test image data'),
    };

    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPhoto]),
        }),
      }),
    });

    mockChatCompletionsCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: null,
          },
        },
      ],
    });

    const { POST } = await import('./route');
    const request = new Request('http://localhost:3000/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageId: 1 }),
    }) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.text).toBe('テキストを抽出できませんでした');
  });
});
