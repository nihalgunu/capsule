import { NextRequest, NextResponse } from 'next/server';
import { processIntervention } from '@/lib/gemini';
import { WorldState, Intervention, InterventionResult } from '@/lib/types';
import { MOCK_WORLD_STATE_2000BC } from '@/lib/mock-data';

// Mock intervention result for development
function generateMockResult(
  intervention: string,
  lat: number,
  lng: number,
  currentState: WorldState
): InterventionResult {
  // Create modified cities with causal notes
  const modifiedCities = currentState.cities.map((city, index) => {
    const isNearIntervention = Math.abs(city.lat - lat) < 20 && Math.abs(city.lng - lng) < 30;

    if (isNearIntervention) {
      return {
        ...city,
        brightness: Math.min(city.brightness + 0.2, 1),
        techLevel: Math.min(city.techLevel + 1, 10),
        change: 'brighter' as const,
        causalNote: `Because ${intervention}, this region experienced accelerated development and increased trade.`,
        imagePrompt: index < 3 ? `A transformed ${city.name} in an alternate timeline. The city has grown dramatically, with new architectural styles blending ${city.civilization} traditions with foreign influences. Bustling markets, impressive monuments, and a sense of prosperity and cultural fusion.` : undefined,
      };
    }

    return {
      ...city,
      change: 'unchanged' as const,
    };
  });

  // Add some new cities that emerged due to the intervention
  const newCities = [
    {
      id: `new-city-${Date.now()}`,
      name: 'New Trade Hub',
      lat: lat + 5,
      lng: lng + 5,
      population: 15000,
      brightness: 0.7,
      techLevel: 4,
      civilization: 'Emerging',
      description: 'A new city that emerged as a result of changed trade patterns.',
      causalNote: `Because ${intervention}, this location became a crucial nexus for new trade routes.`,
      change: 'new' as const,
    },
  ];

  return {
    milestones: [
      {
        year: currentState.year + 500,
        lat,
        lng,
        event: `The effects of "${intervention}" begin to spread`,
        causalLink: 'Direct result of player intervention',
      },
      {
        year: currentState.year + 1000,
        lat: lat + 10,
        lng: lng + 10,
        event: 'Neighboring regions adopt new practices',
        causalLink: 'Cultural diffusion from intervention point',
      },
      {
        year: currentState.year + 1500,
        lat: lat + 20,
        lng: lng - 10,
        event: 'Trade networks restructure around new centers',
        causalLink: 'Economic ripple effects',
      },
    ],
    citiesAffected: [...modifiedCities, ...newCities],
    tradeRoutes: currentState.tradeRoutes.map((route) => ({
      ...route,
      volume: route.volume + 1,
      causalNote: `Trade increased due to ${intervention}`,
    })),
    regions: currentState.regions,
    worldNarrative: `The world has been transformed by the player's intervention: "${intervention}". New powers are rising, old empires are adapting, and the flow of history has been forever altered.`,
    narrationScript: `From the point of intervention, a wave of change spreads across the globe. ${intervention.charAt(0).toUpperCase() + intervention.slice(1)} sends ripples through trade networks and political alliances. Cities that once dominated begin to share power with new rising centers. By the end of this epoch, the world map has been redrawn by forces set in motion by a single decision.`,
    mostSurprising: {
      lat: lat + 15,
      lng: lng + 20,
      description: 'An unexpected civilization emerged in this unlikely location',
      causalChain: [
        'Player intervention changes local dynamics',
        'Displaced peoples migrate to new territories',
        'They bring knowledge and practices to fertile land',
        'A new civilization flourishes where none existed before',
      ],
      imagePrompt: 'A magnificent city rising from an unexpected location, blending multiple architectural traditions. Towering structures of stone and bronze, bustling markets filled with exotic goods, scholars and merchants from distant lands gathering in grand plazas. Golden sunlight illuminates a civilization that history never saw.',
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      intervention,
      lat,
      lng,
      currentState,
      previousInterventions,
      startYear,
      endYear,
      useMock = false,
    } = body;

    // Validate required fields
    if (!intervention || lat === undefined || lng === undefined || !currentState) {
      return NextResponse.json(
        { error: 'Missing required fields: intervention, lat, lng, currentState' },
        { status: 400 }
      );
    }

    // Use mock data if requested or if no API key
    if (useMock || !process.env.GEMINI_API_KEY) {
      console.log('Using mock data for intervention');
      const mockResult = generateMockResult(intervention, lat, lng, currentState);
      return NextResponse.json(mockResult);
    }

    // Process intervention using Gemini
    const result = await processIntervention(
      intervention,
      lat,
      lng,
      currentState,
      previousInterventions || [],
      startYear,
      endYear
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in intervene API:', error);

    // Try to return mock data on error
    try {
      const body = await request.json();
      const mockResult = generateMockResult(
        body.intervention || 'unknown intervention',
        body.lat || 0,
        body.lng || 0,
        body.currentState || MOCK_WORLD_STATE_2000BC
      );
      return NextResponse.json(mockResult);
    } catch {
      return NextResponse.json(
        { error: 'Failed to process intervention' },
        { status: 500 }
      );
    }
  }
}
