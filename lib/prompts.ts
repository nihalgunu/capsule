// Chronicle: Prompt Templates

export const WORLD_GENERATION_PROMPT = (epoch: number, year: string) => `
Generate the state of Earth at ${year} for an alternate history game.

You are creating data for a 3D globe visualization. Be geographically accurate.

Include:
- 15-20 cities/settlements with:
  - id: unique string identifier
  - name: city name
  - lat: latitude (-90 to 90)
  - lng: longitude (-180 to 180)
  - population: number (appropriate for the era)
  - brightness: 0-1 (how prominent on the globe)
  - techLevel: 1-10 (1=stone age, 10=space age)
  - civilization: civilization name
  - description: 1-2 sentences about this place

- 5-8 trade routes connecting cities
- 5-7 civilization regions with colors and territories
- A 3-sentence narrative of the overall state

Focus on geographic accuracy. Major centers in correct locations.
Distribute across continents for visual interest.
`;

export const INTERVENTION_PROMPT = (
  intervention: string,
  lat: number,
  lng: number,
  currentState: string,
  previousInterventions: string,
  startYear: string,
  endYear: string,
  yearSpan: string
) => `
You are simulating ${yearSpan} years of alternate history on a 3D globe.

CURRENT WORLD STATE:
${currentState}

PREVIOUS INTERVENTIONS:
${previousInterventions}

NEW INTERVENTION:
Location: ${lat.toFixed(2)}, ${lng.toFixed(2)}
Change: "${intervention}"
Simulate from ${startYear} to ${endYear}.

CRITICAL INSTRUCTIONS:

1. GEOGRAPHIC SPREAD: Changes radiate outward from ${lat.toFixed(2)}, ${lng.toFixed(2)}.
   - Immediate neighbors (within 500km) affected first
   - Regional effects (within 2000km) within centuries
   - Continental effects within millennia
   - Global effects by end of period

2. BE BOLD: This is alternate history! Don't be conservative.
   - Small changes cascade dramatically over ${yearSpan} years
   - Civilizations can rise and fall
   - Technology can accelerate or stagnate
   - Trade routes can redirect wealth to unexpected places

3. CAUSAL CHAINS: Every affected city needs a causalNote:
   - "Because [player's intervention], [direct consequence] → [indirect consequence] → [what happened here]"
   - Be specific! Name technologies, trade goods, conflicts

4. NARRATION SCRIPT: Write 4-6 sentences for a documentary narrator:
   - Describe the ripple spreading geographically
   - Name specific regions and what's happening
   - Build drama and wonder
   - This will be read aloud by TTS

5. IMAGE PROMPTS: For the 3 most changed cities, describe:
   - Architectural style (influenced by alternate history)
   - Atmosphere (bustling, ruined, transformed)
   - Notable visual features
   - 50-80 words each

6. MILESTONES: 6-8 key events with lat/lng coordinates:
   - Spread across the time period
   - Each advances the alternate timeline
   - Include causal links to the intervention
`;

export const REGION_CONTEXT_PROMPT = (
  lat: number,
  lng: number,
  year: string,
  currentState: string
) => `
CURRENT WORLD STATE:
${currentState}

The player has zoomed into: ${lat.toFixed(2)}, ${lng.toFixed(2)}
Current year: ${year}

Provide context for this region and suggest interventions.

REGION DESCRIPTION (2-3 sentences):
- What civilizations are here?
- What's the current situation?
- What tensions or opportunities exist?

INTERVENTION SUGGESTIONS (3-4 options):
Each should be:
- Specific to this location and time
- Historically grounded or plausible
- Likely to produce dramatic cascading effects
- Varied in type (technology, politics, nature, culture)

Good examples:
- "A volcanic eruption destroys [city], redirecting trade"
- "[People] discover iron smelting 500 years early"
- "A charismatic leader unifies the [region] tribes"
- "[Technology] spreads from [distant place] via traders"

Bad examples:
- "Something good happens" (too vague)
- "Aliens arrive" (not historically grounded)
- "Everyone dies" (not interesting to simulate)
`;

export const NARRATION_STYLE = `
Voice: Documentary narrator, authoritative but awed
Pacing: Slow, measured, with natural pauses
Tone: Wonder at the sweep of history
Geography: Reference specific regions as effects spread
Drama: Build tension and surprise
`;

export const IMAGE_STYLE = `
Style: Painterly historical illustration
Lighting: Dramatic, cinematic
Palette: Warm (amber, gold, deep blue)
Detail: Rich texture, architectural elements
Mood: Atmospheric, evocative
Format: 16:9, no text overlays
`;
