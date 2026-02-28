# Chronicle v2 — One City, One Journey

## Core Change

The user picks **ONE city** in epoch 1. That city is their city for the entire game. Every decision across 4 epochs affects that city's trajectory. At the end, AI scores how well that city's journey contributed to interstellar travel.

Epoch 1's city selection is the **most important decision** in the game. The UI must give strong context — pros, cons, strategic value — so the user chooses wisely.

## Game Flow

```
EPOCH 1 (10000 BC) — CHOOSE YOUR CITY
  Globe shows 15 cities. User browses by clicking.
  Clicking a city → full-screen image with:
    - City name, civilization, description
    - Pros: "Strategic advantages for reaching the stars"
    - Cons: "Challenges this city faces"
    - Back button to browse others
  User types their first intervention → CITY LOCKED IN
  Ripple → advance to epoch 2

EPOCH 2 (2000 BC) — YOUR CITY EVOLVES
  Globe shows world. Auto-flies to your city.
  City panel (text): how your city changed because of epoch 1 decision
  World TLDR: global context + how your city fits
  User types intervention → ripple → advance to epoch 3

EPOCH 3 (1 AD) — SAME
EPOCH 4 (2000 AD) — SAME (background: final image generation starts)

EPOCH 5 (4000 AD) — RESULTS
  Full-screen: AI-generated image as background
  City name: "Your journey began in {city}"
  Score (0-100), reasoning, causal chain of all 4 decisions
  "Play Again"
```

## What Changes From Current Implementation

### Simplified (removes complexity)
- No zoom-to-intervene mechanic for epochs 2-4
- No InterventionPanel component (input embedded in city panel for ALL epochs)
- No region-context API calls
- No nearby-city navigation in epochs 2-4
- No zoom handler logic

### New
- `chosenCity` in store — set once in epoch 1, persists across all epochs
- City selection screen with pros/cons per city (static from mock data)
- Auto-fly-to-city on each epoch transition
- AI prompts focused on ONE city's evolution
- Final score screen with city name + AI image background

### Kept
- Globe (shows world context even though interaction is one city)
- World TLDR / narrative panel
- Ripple animation
- Optimistic updates
- 5 epochs, same years, same goal

---

## Static vs Dynamic

### STATIC (0ms)
| Element | Source |
|---------|--------|
| 15 city images (epoch 1) | `public/cities/{id}.png` |
| City pros/cons (epoch 1) | `lib/mock-data.ts` — `pros` and `cons` fields |
| Mock world data per epoch | `lib/mock-data.ts` |
| Goal statement | Hardcoded constant |
| UI, globe, animations | CSS + three-globe |

### DYNAMIC (AI, has latency)
| Element | Latency | Fallback |
|---------|---------|----------|
| World narrative after intervention | ~10-15s | Optimistic text |
| Your city's evolved state + causal note | ~10-15s | Optimistic update |
| Final image (epoch 5) | ~10s | Loading spinner |
| Score + analysis | ~5s | Generic fallback |

---

## File-by-File Changes

### 1. `lib/types.ts`
- Add `pros?: string` and `cons?: string` to `City` interface
- Add `chosenCity: City | null` to `GameState`
- Remove `zoomedIn` and `zoomLocation` from `GameState`

### 2. `lib/mock-data.ts`
- Add `pros` and `cons` to all 15 epoch 1 cities. Examples:
  - Göbekli Tepe: pros "Earliest monumental architecture — head start on organized labor", cons "Isolated hilltop, limited farmland"
  - Jericho: pros "Fertile land, water, crossroads of early trade", cons "Vulnerable to invasion from all directions"
  - Hemudu: pros "Rice surplus gives massive food advantage", cons "Isolated from other civilizations"
  - Nile Settlements: pros "Predictable flooding = reliable agriculture", cons "Desert on all sides limits expansion"

### 3. `lib/store.ts`
- Add `chosenCity: City | null` to state
- Remove `zoomedIn`, `zoomLocation`, `setZoomedIn`
- `submitIntervention(description)` — lat/lng comes from `chosenCity` (after epoch 1, from the selected city)
- Epoch 1 submit: set `chosenCity` from `selectedCity`
- Epochs 2-4: auto-select `chosenCity`, `interventionsRemaining = 1`, auto-advance
- AI prompt always includes chosen city context

### 4. `components/CityDetail.tsx`

**Epoch 1 — City selection / immersive:**
- Full-screen preset .png background
- Overlaid at bottom: city name (large), civilization, description
- **Pros** (green left border): 1-2 sentences on strategic advantages
- **Cons** (red left border): 1-2 sentences on challenges
- "What will you change?" input + "Change History" submit
- "Back to globe" button (top-left) to browse other cities
- On submit: locks in city, fires intervention

**Epochs 2-4 — Your city panel (text, with embedded input):**
- Right panel, no image
- "Your City: {name}" header with civilization
- AI-generated description of current state
- Causal note: "Because you {decision}, {effect}"
- Tech level dots
- Intervention input + submit button embedded in panel
- No separate InterventionPanel needed

### 5. `components/InterventionPanel.tsx`
- **DELETE** — functionality merged into CityDetail

### 6. `components/Globe.tsx`
- Remove `onZoomChange` prop
- Keep `onCityClick` (epoch 1 only)
- Auto-fly to `chosenCity` on epoch transitions (useEffect on currentEpoch)
- Disable city clicking in epochs 2-4 (locked to chosen city)

### 7. `app/page.tsx`
- Remove all zoom logic, InterventionPanel import
- Epoch 1: globe → click to browse → full-screen CityDetail → submit → lock city → ripple → advance
- Epochs 2-4: globe auto-flies to city → CityDetail panel with input → submit → ripple → advance
- Epoch 5: GoalScreen
- `handleIntervention` simplified

### 8. `components/GoalScreen.tsx`
- AI image as full background (opacity overlay)
- "Your journey began in {chosenCity.name}" text
- Score, summary, causal chain overlaid
- "Play Again" button

### 9. `lib/gemini.ts` + `app/api/score/route.ts`
- Intervention prompt: "Player chose {city} in {civilization}. Guide THIS city toward interstellar travel."
- Score prompt: "Player started in {city} at 10000 BC..."
- Image prompt: "Show {city} at 4000 AD"
- Score route: accepts `chosenCity` in request body

---

## Implementation Order

| Step | What | Files |
|------|------|-------|
| 1 | Add pros/cons to types + all 15 epoch 1 cities | `lib/types.ts`, `lib/mock-data.ts` |
| 2 | Store: chosenCity, remove zoom, simplify submit | `lib/store.ts` |
| 3 | CityDetail: pros/cons (ep1) + embedded input (ep2-4) | `components/CityDetail.tsx` |
| 4 | Delete InterventionPanel | `components/InterventionPanel.tsx` |
| 5 | Globe: remove zoom handler, auto-fly on epoch | `components/Globe.tsx` |
| 6 | page.tsx: no zoom, simplified flow | `app/page.tsx` |
| 7 | GoalScreen: image bg + city name | `components/GoalScreen.tsx` |
| 8 | AI prompts: city-focused + scoring | `lib/gemini.ts`, `app/api/score/route.ts` |

---

## Latency Budget

| Action | Target | How |
|--------|--------|-----|
| Page load | <1s | Mock data |
| Browse cities (epoch 1) | 0ms per click | Static .png + static pros/cons |
| Submit intervention | 0ms visual | Optimistic update + ripple |
| Epoch transition + fly | ~1s | Mock data + globe fly animation |
| AI result swap | ~10-15s background | Replaces optimistic data seamlessly |
| Final results | ~10-15s | Started during epoch 4 intervention |
