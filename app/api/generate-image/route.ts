import { NextRequest, NextResponse } from 'next/server';
import { generateFinalImage } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { worldState, goal, chosenCity } = body;

  if (!worldState || !goal) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const imageBase64 = await generateFinalImage(worldState, goal, chosenCity);
    return NextResponse.json({ imageBase64 });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ imageBase64: null });
  }
}
