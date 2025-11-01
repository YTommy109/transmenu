import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { menuPhotos } from '@/lib/db/schema';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ファイルサイズは10MB以下にしてください' },
        { status: 400 }
      );
    }

    // ファイルタイプチェック
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'JPEG、PNG、WebP形式の画像のみアップロード可能です' },
        { status: 400 }
      );
    }

    // ファイルをBufferに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // データベースに保存
    const [result] = await db
      .insert(menuPhotos)
      .values({
        filename: file.name,
        imageData: buffer,
      })
      .returning({ id: menuPhotos.id });

    if (!result) {
      return NextResponse.json(
        { error: 'アップロードに失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        id: result.id,
        filename: file.name,
        message: 'アップロードが完了しました',
      },
      { status: 201 }
    );
  } catch (_error) {
    // Log error in production monitoring system
    return NextResponse.json(
      { error: 'アップロード中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const photos = await db
      .select({
        id: menuPhotos.id,
        filename: menuPhotos.filename,
        createdAt: menuPhotos.createdAt,
      })
      .from(menuPhotos)
      .orderBy(menuPhotos.createdAt);

    return NextResponse.json(photos);
  } catch (_error) {
    // Log error in production monitoring system
    return NextResponse.json(
      { error: '画像一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
