import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { menuPhotos } from '@/lib/db/schema';

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number.parseInt(params.id, 10);

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }

    const [photo] = await db
      .select()
      .from(menuPhotos)
      .where(eq(menuPhotos.id, id))
      .limit(1);

    if (!photo) {
      return NextResponse.json(
        { error: '画像が見つかりません' },
        { status: 404 }
      );
    }

    // 画像のMIMEタイプを判定（簡易的な判定）
    const getContentType = (filename: string): string => {
      const ext = filename.toLowerCase().split('.').pop();
      switch (ext) {
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg';
        case 'png':
          return 'image/png';
        case 'webp':
          return 'image/webp';
        default:
          return 'image/jpeg';
      }
    };

    // Buffer を Uint8Array に変換
    const imageBuffer = Buffer.from(photo.imageData);

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': getContentType(photo.filename),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (_error) {
    // Log error in production monitoring system
    return NextResponse.json(
      { error: '画像の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
