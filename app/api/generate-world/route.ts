import { NextRequest, NextResponse } from 'next/server';
import { generateWorld } from '@/lib/gemini';
import { MOCK_WORLD_STATE_10000BC, MOCK_WORLD_STATE_2000BC } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { epoch = 1, startYear = -10000, useMock = false } = body;

    // Use mock data if requested or if no API key
    if (useMock || !process.env.GEMINI_API_KEY) {
      console.log('Using mock data for world generation');
      if (epoch === 1) {
        return NextResponse.json(MOCK_WORLD_STATE_10000BC);
      } else {
        return NextResponse.json(MOCK_WORLD_STATE_2000BC);
      }
    }

    // Generate world using Gemini
    const worldState = await generateWorld(epoch, startYear);
    return NextResponse.json(worldState);
  } catch (error) {
    console.error('Error in generate-world API:', error);

    // Fallback to mock data on error
    return NextResponse.json(MOCK_WORLD_STATE_10000BC);
  }
}
