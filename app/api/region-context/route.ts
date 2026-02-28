import { NextRequest, NextResponse } from 'next/server';
import { getRegionContext } from '@/lib/gemini';
import { WorldState, RegionContext } from '@/lib/types';

// Mock region context for development
function generateMockContext(lat: number, lng: number, year: number): RegionContext {
  // Determine region based on coordinates
  let region = 'Unknown Region';
  let civilization = 'Local peoples';

  if (lat > 25 && lat < 45 && lng > 30 && lng < 50) {
    region = 'Fertile Crescent';
    civilization = 'Mesopotamian and Levantine';
  } else if (lat > 20 && lat < 35 && lng > 25 && lng < 40) {
    region = 'Egypt and the Nile';
    civilization = 'Egyptian';
  } else if (lat > 25 && lat < 40 && lng > 60 && lng < 80) {
    region = 'Indus Valley';
    civilization = 'Indus Valley';
  } else if (lat > 20 && lat < 45 && lng > 100 && lng < 130) {
    region = 'East Asia';
    civilization = 'Chinese';
  } else if (lat > 30 && lat < 50 && lng > -10 && lng < 30) {
    region = 'Mediterranean';
    civilization = 'Mediterranean';
  } else if (lat > 40 && lat < 60 && lng > -10 && lng < 40) {
    region = 'Northern Europe';
    civilization = 'European tribal';
  } else if (lat > -20 && lat < 20 && lng > -80 && lng < -30) {
    region = 'Americas';
    civilization = 'Pre-Columbian';
  }

  const yearDisplay = year < 0 ? `${Math.abs(year)} BC` : `${year} AD`;

  return {
    description: `The ${region} at ${yearDisplay}. ${civilization} peoples dominate this area, with established settlements and developing trade networks. Tensions between neighboring groups create both conflict and opportunity for change.`,
    suggestions: [
      {
        text: `A charismatic leader unifies the scattered ${region} tribes into a powerful confederation`,
        reasoning: 'Political unification often accelerates technological and cultural development',
      },
      {
        text: `${civilization} metallurgists discover a revolutionary new alloy 500 years ahead of schedule`,
        reasoning: 'Technological leaps can reshape military and economic balances across regions',
      },
      {
        text: `A devastating plague sweeps through ${region}, decimating the population but opening land for newcomers`,
        reasoning: 'Catastrophes can redirect the flow of history by clearing paths for new civilizations',
      },
      {
        text: `Traders from a distant land arrive with exotic goods and revolutionary ideas`,
        reasoning: 'Cross-cultural contact often sparks innovation and changes power dynamics',
      },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng, currentState, useMock = false } = body;

    // Validate required fields
    if (lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: lat, lng' },
        { status: 400 }
      );
    }

    // Use mock data if requested or if no API key
    if (useMock || !process.env.GEMINI_API_KEY) {
      console.log('Using mock data for region context');
      const year = currentState?.year || -10000;
      const mockContext = generateMockContext(lat, lng, year);
      return NextResponse.json(mockContext);
    }

    // Get region context using Gemini
    const context = await getRegionContext(lat, lng, currentState);
    return NextResponse.json(context);
  } catch (error) {
    console.error('Error in region-context API:', error);

    // Fallback to mock data
    const body = await request.json().catch(() => ({}));
    const mockContext = generateMockContext(
      body.lat || 0,
      body.lng || 0,
      body.currentState?.year || -10000
    );
    return NextResponse.json(mockContext);
  }
}
