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

  const { interventions, worldState, goal } = body as {
    interventions: Intervention[];
    worldState: WorldState;
    goal: string;
  };

  if (!interventions || !worldState || !goal) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Run scoring and image generation in parallel
  const [scoreResult, imageResult] = await Promise.allSettled([
    generateScore(interventions, worldState, goal),
    generateFinalImage(worldState, goal),
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
