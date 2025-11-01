import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockInsert = vi.fn();
const mockSelect = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    insert: mockInsert,
    select: mockSelect,
  },
}));

vi.mock('@/lib/db/schema', () => ({
  menuPhotos: {
    id: 'id',
    filename: 'filename',
    imageData: 'imageData',
    createdAt: 'createdAt',
  },
}));

describe('POST /api/menu-photos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('ファイルが選択されていない場合、44０エラーを返す', async () => {
    const { POST } = await import('./route');
    const formData = new FormData();
    const request = new Request('http://localhost:3000/api/menu-photos', {
      method: 'POST',
      body: formData,
    }) as NextRequest;
    // @ts-expect-error - override for test
    request.formData = async () => formData;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('ファイルが選択されていません');
  });

  it('ファイルサイズが10MBを超える場合、44０エラーを返す', async () => {
    const { POST } = await import('./route');
    const largeContent = new Uint8Array(11 * 1024 * 1024); // 11MB
    const mockFile = new File([largeContent], 'large.jpg', {
      type: 'image/jpeg',
    });
    const formData = new FormData();
    formData.append('file', mockFile);

    const request = new Request('http://localhost:3000/api/menu-photos', {
      method: 'POST',
      body: formData,
    }) as NextRequest;
    // @ts-expect-error - override for test
    request.formData = async () => formData;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('ファイルサイズは10MB以下にしてください');
  });

  it('許可されていないファイルタイプの場合、44０エラーを返す', async () => {
    const { POST } = await import('./route');
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', mockFile);

    const request = new Request('http://localhost:3000/api/menu-photos', {
      method: 'POST',
      body: formData,
    }) as NextRequest;
    // @ts-expect-error - override for test
    request.formData = async () => formData;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(
      'JPEG、PNG、WebP形式の画像のみアップロード可能です'
    );
  });
});

describe('GET /api/menu-photos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('画像一覧を取得できる', async () => {
    const mockPhotos = [
      { id: 1, filename: 'photo1.jpg', createdAt: new Date('2024-01-01') },
      { id: 2, filename: 'photo2.jpg', createdAt: new Date('2024-01-02') },
    ];

    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue(mockPhotos),
      }),
    });

    const { GET } = await import('./route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0]).toHaveProperty('id', 1);
    expect(data[0]).toHaveProperty('filename', 'photo1.jpg');
  });

  it('画像が存在しない場合、空の配列を返す', async () => {
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue([]),
      }),
    });

    const { GET } = await import('./route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });
});
