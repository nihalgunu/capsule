import { NextRequest, NextResponse } from 'next/server';
import { processIntervention } from '@/lib/gemini';
import { WorldState, InterventionResult } from '@/lib/types';

// Mock intervention result for fallback
function generateMockResult(
  intervention: string,
  lat: number,
  lng: number,
  currentState: WorldState
): InterventionResult {
  const modifiedCities = currentState.cities.map((city) => {
    const isNear = Math.abs(city.lat - lat) < 20 && Math.abs(city.lng - lng) < 30;
    if (isNear) {
      return {
        ...city,
        brightness: Math.min(city.brightness + 0.2, 1),
        techLevel: Math.min(city.techLevel + 1, 10),
        change: 'brighter' as const,
        causalNote: `Because you "${intervention}", this region experienced accelerated development.`,
      };
    }
    return { ...city, change: 'unchanged' as const };
  });

  const newCity = {
    id: `new-${Date.now()}`,
    name: 'New Settlement',
    lat: lat + 5,
    lng: lng + 5,
    population: 15000,
    brightness: 0.7,
    techLevel: Math.min((currentState.cities[0]?.techLevel || 2) + 1, 10),
    civilization: 'Emerging',
    description: 'A settlement that emerged from changed trade patterns.',
    causalNote: `Because you "${intervention}", new communities formed here.`,
    change: 'new' as const,
  };

  return {
    milestones: [
      { year: currentState.year + 500, lat, lng, event: `"${intervention}" begins to spread`, causalLink: 'Direct result' },
      { year: currentState.year + 1500, lat: lat + 15, lng: lng + 10, event: 'Trade networks restructure', causalLink: 'Ripple effects' },
    ],
    citiesAffected: [...modifiedCities, newCity],
    tradeRoutes: currentState.tradeRoutes,
    regions: currentState.regions,
    worldNarrative: `The world has been transformed by "${intervention}". New powers are rising and old empires are adapting as the ripples of change spread across civilizations.`,
    narrationScript: `From the point of intervention, a wave of change spreads. ${intervention.charAt(0).toUpperCase() + intervention.slice(1)} reshapes trade and alliances. The world map is being redrawn.`,
    mostSurprising: {
      lat: lat + 15,
      lng: lng + 20,
      description: 'An unexpected civilization emerged in this unlikely location.',
      causalChain: ['Player intervention changes local dynamics', 'Displaced peoples migrate', 'A new civilization flourishes'],
    },
  };
}

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { intervention, lat, lng, currentState, previousInterventions, startYear, endYear, useMock = false } = body;

  if (!intervention || lat === undefined || lng === undefined || !currentState) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (useMock || !process.env.GEMINI_API_KEY) {
    return NextResponse.json(generateMockResult(intervention, lat, lng, currentState));
  }

  try {
    const result = await processIntervention(intervention, lat, lng, currentState, previousInterventions || [], startYear, endYear);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in intervene API:', error);
    return NextResponse.json(generateMockResult(intervention, lat, lng, currentState));
  }
}
