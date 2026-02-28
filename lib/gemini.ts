// Chronicle: Gemini API Client
import { GoogleGenAI } from '@google/genai';
import { WorldState, InterventionResult, RegionContext, Intervention } from './types';

// Initialize the Gemini client
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Model configurations
const MODELS = {
  reasoning: 'gemini-2.5-pro-preview-06-05', // Main reasoning model
  image: 'gemini-2.0-flash-preview-image-generation', // Image generation
  tts: 'gemini-2.5-flash-preview-tts', // Text-to-speech
};

// Generate initial world state
export async function generateWorld(
  epoch: number,
  startYear: number
): Promise<WorldState> {
  const yearDisplay = startYear < 0 ? `${Math.abs(startYear)} BC` : `${startYear} AD`;

  const prompt = `Generate the state of Earth at ${yearDisplay} for an alternate history game.

You are creating data for a 3D globe visualization. Be geographically accurate.

Include:
- 15-20 cities/settlements with:
  - id: unique string identifier
  - name: city name
  - lat: latitude (-90 to 90)
  - lng: longitude (-180 to 180)
  - population: number (100-50000 for this era)
  - brightness: 0-1 (how prominent on the globe)
  - techLevel: 1-10 (1=stone age, 10=space age)
  - civilization: civilization name
  - description: 1-2 sentences about this place

- 5-8 trade routes with:
  - id: unique string
  - from: { lat, lng, city: city name }
  - to: { lat, lng, city: city name }
  - volume: 1-10 (thickness of arc)
  - description: what's being traded

- 5-7 civilization regions with:
  - id: unique string
  - civilization: civilization name
  - color: hex color string
  - center: { lat, lng }
  - radius: territory size in degrees

- narrative: 3-sentence overall world description

Focus on geographic accuracy. Major centers should be in correct locations.
Distribute cities across multiple continents for visual interest.

Return valid JSON matching this TypeScript interface:
{
  year: number,
  epoch: ${epoch},
  cities: City[],
  tradeRoutes: TradeRoute[],
  regions: Region[],
  narrative: string
}`;

  try {
    const response = await genAI.models.generateContent({
      model: MODELS.reasoning,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const worldState = JSON.parse(text) as WorldState;

    // Ensure epoch and year are set correctly
    worldState.epoch = epoch as 1 | 2 | 3 | 4;
    worldState.year = startYear;

    return worldState;
  } catch (error) {
    console.error('Error generating world:', error);
    throw error;
  }
}

// Process an intervention and simulate consequences
export async function processIntervention(
  intervention: string,
  lat: number,
  lng: number,
  currentState: WorldState,
  previousInterventions: Intervention[],
  startYear: number,
  endYear: number
): Promise<InterventionResult> {
  const startYearDisplay = startYear < 0 ? `${Math.abs(startYear)} BC` : `${startYear} AD`;
  const endYearDisplay = endYear < 0 ? `${Math.abs(endYear)} BC` : `${endYear} AD`;
  const yearSpan = Math.abs(endYear - startYear);

  const prompt = `You are simulating ${yearSpan.toLocaleString()} years of alternate history on a 3D globe.

CURRENT WORLD STATE:
${JSON.stringify(currentState, null, 2)}

PREVIOUS INTERVENTIONS:
${JSON.stringify(previousInterventions, null, 2)}

NEW INTERVENTION:
Location: ${lat.toFixed(2)}, ${lng.toFixed(2)}
Change: "${intervention}"
Simulate from ${startYearDisplay} to ${endYearDisplay}.

INSTRUCTIONS:
1. Starting from the intervention location, reason about how this change spreads geographically and temporally across the globe over ${yearSpan.toLocaleString()} years.

2. Changes should radiate outward from the intervention point. Nearby regions are affected first and most strongly. Distant regions are affected later and more indirectly.

3. Account for all previous interventions. New consequences must be consistent with the already-altered world.

4. Be BOLD and CREATIVE. Small changes cascade dramatically over millennia. Don't be conservative - this is alternate history!

5. Every affected city MUST have a causalNote explaining why it changed, traced back to the player's intervention(s). Format: "Because [intervention], [consequence happened here]."

6. Include a narrationScript: 4-6 sentences that a narrator would speak as the ripple spreads across the globe. Reference specific geographic regions and what's happening there. This will be read aloud by text-to-speech.

7. For the 3 most dramatically changed cities, include an imagePrompt: a detailed description (50-80 words) of what this city looks like in the alternate timeline. Include architectural style, atmosphere, notable features. This will be used for image generation.

8. Include 6-8 milestone events spread across the time period, each with geographic coordinates.

Return JSON matching this structure:
{
  milestones: [{ year: number, lat: number, lng: number, event: string, causalLink: string }],
  citiesAffected: City[], // Full updated city list (not just changes)
  tradeRoutes: TradeRoute[], // Full updated list
  regions: Region[], // Full updated list
  worldNarrative: string, // Overall state description
  narrationScript: string, // 4-6 sentences for TTS narration
  mostSurprising: {
    lat: number,
    lng: number,
    description: string,
    causalChain: string[], // Step by step causal chain
    imagePrompt: string // Detailed visual description
  }
}`;

  try {
    const response = await genAI.models.generateContent({
      model: MODELS.reasoning,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const result = JSON.parse(text) as InterventionResult;

    return result;
  } catch (error) {
    console.error('Error processing intervention:', error);
    throw error;
  }
}

// Get region context when player zooms in
export async function getRegionContext(
  lat: number,
  lng: number,
  currentState: WorldState
): Promise<RegionContext> {
  const yearDisplay = currentState.year < 0
    ? `${Math.abs(currentState.year)} BC`
    : `${currentState.year} AD`;

  const prompt = `CURRENT WORLD STATE:
${JSON.stringify(currentState, null, 2)}

The player has zoomed into coordinates: ${lat.toFixed(2)}, ${lng.toFixed(2)}
Current year: ${yearDisplay}

Provide:
1. A 2-3 sentence description of this region at this time. What civilizations are here? What's happening?

2. 3-4 suggested interventions specific to this region and time period. Each should be:
   - Historically grounded (or plausible for this era)
   - Likely to produce interesting cascading consequences
   - Specific to this geographic location

Return JSON:
{
  "description": "string",
  "suggestions": [
    { "text": "intervention description", "reasoning": "why this would be interesting" }
  ]
}`;

  try {
    const response = await genAI.models.generateContent({
      model: MODELS.reasoning,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    return JSON.parse(text) as RegionContext;
  } catch (error) {
    console.error('Error getting region context:', error);
    throw error;
  }
}

// Generate TTS narration audio
export async function generateNarration(script: string): Promise<string> {
  const prompt = `Narrate the following in a documentary voice. Authoritative, measured, slightly awed. Pace it slowly, with natural pauses between geographic shifts:

"${script}"`;

  try {
    const response = await genAI.models.generateContent({
      model: MODELS.tts,
      contents: prompt,
      config: {
        responseModalities: ['audio'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    // Extract audio data from response
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data; // Base64 audio
        }
      }
    }

    throw new Error('No audio data in response');
  } catch (error) {
    console.error('Error generating narration:', error);
    throw error;
  }
}

// Generate city illustration
export async function generateCityImage(imagePrompt: string): Promise<string> {
  const prompt = `Generate a detailed, atmospheric illustration in a historical art style.

The scene: ${imagePrompt}

Style: Painterly, dramatic cinematic lighting, rich texture and detail. Color palette leans warm (amber, gold, deep blue). Slight stylization, not photorealistic. 16:9 aspect ratio. No text overlays.`;

  try {
    const response = await genAI.models.generateContent({
      model: MODELS.image,
      contents: prompt,
    });

    // Extract image data from response
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data; // Base64 image
        }
      }
    }

    throw new Error('No image data in response');
  } catch (error) {
    console.error('Error generating city image:', error);
    throw error;
  }
}
