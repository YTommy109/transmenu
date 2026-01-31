import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { menuPhotos } from '@/lib/db/schema';
import { DEFAULT_MODEL, getOpenAIClient } from '@/lib/openai';

// OCR用のプロンプト
const OCR_PROMPT =
  'この画像に含まれるすべてのテキストを抽出してください。メニューの場合、料理名、価格、説明などを含めてください。テキストは元の配置や構造を可能な限り保持してください。';

// 画像のMIMEタイプを判定（既存のパターンを参考）
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

export async function POST(request: NextRequest) {
  try {
    // リクエストボディからimageIdを取得
    let body: { imageId?: number };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const imageId = body.imageId;

    // imageIdのバリデーション
    if (imageId === undefined || imageId === null) {
      return NextResponse.json(
        { error: 'imageId is required' },
        { status: 400 }
      );
    }

    const id = Number.parseInt(String(imageId), 10);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: 'imageId must be a valid number' },
        { status: 400 }
      );
    }

    // データベースから画像データを取得
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

    // 画像Bufferをbase64形式に変換
    const imageBuffer = Buffer.from(photo.imageData);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getContentType(photo.filename);
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // OpenAI Vision APIを呼び出す
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: OCR_PROMPT,
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    // OpenAI APIレスポンスから抽出テキストを取得
    const extractedText =
      completion.choices[0]?.message?.content || 'テキストを抽出できませんでした';

    return NextResponse.json({ text: extractedText }, { status: 200 });
  } catch (error) {
    // エラーハンドリング
    // biome-ignore lint/suspicious/noConsole: Development logging
    console.error('OCR API error:', error);

    // OpenAI APIエラーの場合
    if (error instanceof Error && error.message.includes('OpenAI')) {
      return NextResponse.json(
        { error: 'OCR処理中にエラーが発生しました' },
        { status: 500 }
      );
    }

    // その他のエラー
    return NextResponse.json(
      { error: 'OCR処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
