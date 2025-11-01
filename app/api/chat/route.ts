import { type NextRequest, NextResponse } from 'next/server';
import { DEFAULT_MODEL, getOpenAIClient } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    let message: string;
    try {
      const body = await request.json();
      message = body.message;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      maxTokens: 150,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'No response';

    return NextResponse.json({ reply });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Development logging
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from OpenAI' },
      { status: 500 }
    );
  }
}
