import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { NextRequest } from 'next/server';

const mockSelect = vi.fn();

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

describe('GET /api/menu-photos/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('指定されたIDの画像を取得できる', async () => {
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

    const { GET } = await import('./route');
    const request = new Request(
      'http://localhost:3000/api/menu-photos/1'
    ) as NextRequest;
    const params = Promise.resolve({ id: '1' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/jpeg');
    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=31536000, immutable'
    );
  });

  it('無効なIDの場合、44０エラーを返す', async () => {
    const { GET } = await import('./route');
    const request = new Request(
      'http://localhost:3000/api/menu-photos/invalid'
    ) as NextRequest;
    const params = Promise.resolve({ id: 'invalid' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('無効なIDです');
  });

  it('画像が見つからない場合、44４エラーを返す', async () => {
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const { GET } = await import('./route');
    const request = new Request(
      'http://localhost:3000/api/menu-photos/999'
    ) as NextRequest;
    const params = Promise.resolve({ id: '999' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('画像が見つかりません');
  });



});
