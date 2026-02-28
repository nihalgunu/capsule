import { GoogleGenAI } from '@google/genai';
import { WorldState, InterventionResult, Intervention, GOAL_STATE } from './types';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const MODELS = {
  reasoning: 'gemini-2.5-flash',
  image: 'gemini-2.0-flash-preview-image-generation',
};

// Generate initial world state for an epoch
export async function generateWorld(epoch: number, startYear: number): Promise<WorldState> {
  const yearDisplay = startYear < 0 ? `${Math.abs(startYear)} BC` : `${startYear} AD`;

  const prompt = `Generate Earth at ${yearDisplay} for an alternate history game. Goal: ${GOAL_STATE}.

Include 12-15 cities with: id, name, lat, lng, population, brightness (0-1), techLevel (1-10), civilization, description (1 sentence).
Include 4-6 trade routes with: id, from {lat,lng,city}, to {lat,lng,city}, volume (1-10), description.
Include 4-6 regions with: id, civilization, color (hex), center {lat,lng}, radius.
Include narrative: 2-3 sentences about the world state.

Return JSON: {year,epoch:${epoch},cities,tradeRoutes,regions,narrative}`;

  const response = await genAI.models.generateContent({
    model: MODELS.reasoning,
    contents: prompt,
    config: { responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 1024 } },
  });

  const worldState = JSON.parse(response.text || '') as WorldState;
  worldState.epoch = epoch as 1 | 2 | 3 | 4 | 5;
  worldState.year = startYear;
  return worldState;
}

// Process an intervention — the core AI call
export async function processIntervention(
  intervention: string,
  lat: number,
  lng: number,
  currentState: WorldState,
  previousInterventions: Intervention[],
  startYear: number,
  endYear: number,
  chosenCity?: { name: string; civilization: string }
): Promise<InterventionResult> {
  const startDisplay = startYear < 0 ? `${Math.abs(startYear)} BC` : `${startYear} AD`;
  const endDisplay = endYear < 0 ? `${Math.abs(endYear)} BC` : `${endYear} AD`;

  const prevDecisions = previousInterventions
    .map(i => `"${i.description}" at ${i.year < 0 ? Math.abs(i.year) + ' BC' : i.year + ' AD'}`)
    .join('; ');

  const cityContext = chosenCity
    ? `Player chose ${chosenCity.name} (${chosenCity.civilization}) as their ONE city for the entire game. All interventions happen here. Focus on how THIS city evolves.`
    : '';

  const prompt = `Alternate history: ${startDisplay} to ${endDisplay}. Player goal: ${GOAL_STATE}.
${cityContext}

STATE: ${JSON.stringify(currentState)}

PREVIOUS DECISIONS: ${prevDecisions || 'None'}

NEW INTERVENTION at (${lat.toFixed(1)},${lng.toFixed(1)}): "${intervention}"

RULES:
- Every city causalNote MUST reference the exact previous intervention: "Because you [intervention text], [effect]."
- worldNarrative (2-3 sentences) must reference previous decisions AND hint at progress toward interstellar travel
- Keep descriptions to 1 sentence per city
- Return 10-15 cities (existing + 1-2 new)
- Each city needs change: "brighter"|"dimmer"|"new"|"gone"|"unchanged"

JSON: {milestones:[{year,lat,lng,event,causalLink}],citiesAffected:[{id,name,lat,lng,population,brightness,techLevel,civilization,description,causalNote,change}],tradeRoutes:[{id,from:{lat,lng,city},to:{lat,lng,city},volume,description}],regions:[{id,civilization,color,center:{lat,lng},radius}],worldNarrative:"",narrationScript:"3 sentences",mostSurprising:{lat,lng,description,causalChain:["..."]}}`;

  const response = await genAI.models.generateContent({
    model: MODELS.reasoning,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      maxOutputTokens: 16384,
      thinkingConfig: { thinkingBudget: 2048 },
    },
  });

  return JSON.parse(response.text || '') as InterventionResult;
}

// Score the player's 4 decisions against the goal
export async function generateScore(
  interventions: Intervention[],
  worldState: WorldState,
  goal: string,
  chosenCity?: { name: string; civilization: string } | null
): Promise<{ score: number; summary: string; causalChain: string[] }> {
  const decisions = interventions.map((i, idx) =>
    `${idx + 1}. At ${i.year < 0 ? Math.abs(i.year) + ' BC' : i.year + ' AD'}: "${i.description}"`
  ).join('\n');

  const cityLine = chosenCity
    ? `The player started in ${chosenCity.name} (${chosenCity.civilization}) at 10000 BC and guided this ONE city across 4 epochs.`
    : '';

  const prompt = `You are scoring an alternate history game. ${cityLine} The player made 4 decisions trying to achieve: "${goal}"

Their decisions:
${decisions}

Final world state at ${worldState.year} AD: ${JSON.stringify(worldState)}

Score 0-100 on how close they got to the goal. Be fair but generous — reward creative thinking.
Return JSON: {"score":number,"summary":"3-4 sentences analyzing how their decisions connected","causalChain":["step 1 description","step 2 description","step 3 description","step 4 description","outcome"]}`;

  const response = await genAI.models.generateContent({
    model: MODELS.reasoning,
    contents: prompt,
    config: { responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 2048 } },
  });

  return JSON.parse(response.text || '');
}

// Generate ONE final image of Earth at the goal year
export async function generateFinalImage(worldState: WorldState, goal: string, chosenCity?: { name: string; civilization: string } | null): Promise<string> {
  const cityRef = chosenCity ? ` Focus on the region around ${chosenCity.name}, showing it as a futuristic hub.` : '';
  const prompt = `Generate a cinematic wide-angle view of Earth from low orbit at year ${worldState.year} AD in an alternate timeline. The goal was: ${goal}.${cityRef} Show whether humanity achieved it — spacecraft, orbital stations, or a world that fell short. Dark space background, Earth glowing below. Painterly, dramatic, 16:9. No text.`;

  const response = await genAI.models.generateContent({
    model: MODELS.image,
    contents: prompt,
  });

  const candidate = response.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }
  }
  throw new Error('No image data in response');
}
