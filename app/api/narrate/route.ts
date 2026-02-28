import { NextRequest, NextResponse } from 'next/server';
import { generateNarration } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { script, useMock = false } = body;

    // Validate required fields
    if (!script) {
      return NextResponse.json(
        { error: 'Missing required field: script' },
        { status: 400 }
      );
    }

    // For mock mode or no API key, return empty (frontend will skip audio)
    if (useMock || !process.env.GEMINI_API_KEY) {
      console.log('Skipping TTS in mock mode');
      return NextResponse.json({ audioBase64: null, mock: true });
    }

    // Generate narration using Gemini TTS
    const audioBase64 = await generateNarration(script);
    return NextResponse.json({ audioBase64 });
  } catch (error) {
    console.error('Error in narrate API:', error);
    return NextResponse.json(
      { audioBase64: null, error: 'Failed to generate narration' },
      { status: 500 }
    );
  }
}
