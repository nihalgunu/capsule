import { NextRequest, NextResponse } from 'next/server';
import { generateCityImage } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imagePrompt, useMock = false } = body;

    // Validate required fields
    if (!imagePrompt) {
      return NextResponse.json(
        { error: 'Missing required field: imagePrompt' },
        { status: 400 }
      );
    }

    // For mock mode or no API key, return null (frontend will show placeholder)
    if (useMock || !process.env.GEMINI_API_KEY) {
      console.log('Skipping image generation in mock mode');
      return NextResponse.json({ imageBase64: null, mock: true });
    }

    // Generate image using Gemini
    const imageBase64 = await generateCityImage(imagePrompt);
    return NextResponse.json({ imageBase64 });
  } catch (error) {
    console.error('Error in generate-image API:', error);
    return NextResponse.json(
      { imageBase64: null, error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
