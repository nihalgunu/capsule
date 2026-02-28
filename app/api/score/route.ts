import { NextRequest, NextResponse } from 'next/server';
import { generateScore, generateFinalImage } from '@/lib/gemini';
import { Intervention, WorldState, GameResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { interventions, worldState, goal, chosenCity, skipImage } = body as {
    interventions: Intervention[];
    worldState: WorldState;
    goal: string;
    chosenCity?: { name: string; civilization: string } | null;
    skipImage?: boolean;
  };

  if (!interventions || !worldState || !goal) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // If image already generated early, only run scoring
  if (skipImage) {
    try {
      const score = await generateScore(interventions, worldState, goal, chosenCity);
      const result: GameResult = {
        score: score.score,
        summary: score.summary,
        causalChain: score.causalChain,
        finalImageBase64: null, // client has it already
      };
      return NextResponse.json(result);
    } catch {
      return NextResponse.json({
        score: 50,
        summary: "Your decisions shaped history in unexpected ways.",
        causalChain: interventions.map(i => i.description),
        finalImageBase64: null,
      });
    }
  }

  // Run scoring and image generation in parallel
  const [scoreResult, imageResult] = await Promise.allSettled([
    generateScore(interventions, worldState, goal, chosenCity),
    generateFinalImage(worldState, goal, chosenCity),
  ]);

  const score = scoreResult.status === 'fulfilled' ? scoreResult.value : {
    score: 50,
    summary: "Your decisions shaped history in unexpected ways.",
    causalChain: interventions.map(i => i.description),
  };

  const finalImage = imageResult.status === 'fulfilled' ? imageResult.value : null;

  const result: GameResult = {
    score: score.score,
    summary: score.summary,
    causalChain: score.causalChain,
    finalImageBase64: finalImage,
  };

  return NextResponse.json(result);
}
