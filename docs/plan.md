# Chronicle — Implementation Plan v2

## Vision

5-epoch alternate history game. 1 decision per epoch, 4 total. Goal: **interstellar travel by 4000 AD**. Entire game plays in **2-3 minutes**.

Flow: **Visual (epoch 1) → Text-based (epochs 2-4) → Visual + Score (epoch 5)**

## Epochs

| # | Year | Name | User Action | Time budget |
|---|------|------|-------------|-------------|
| 1 | 10000 BC | Dawn of Civilization | Click city → full-screen image → make a change | ~30s |
| 2 | 2000 BC | Bronze Age | See world TLDR → click city → read TLDR → make a change | ~30s |
| 3 | 1 AD | Classical Era | Same as epoch 2 | ~30s |
| 4 | 2000 AD | Modern Day | Same as epoch 2 | ~30s |
| 5 | 4000 AD | Goal State | See final image + score | ~15s |

---

## Static vs Dynamic Elements

### STATIC (0ms — precomputed, no AI needed)

| Element | Where | Source |
|---------|-------|--------|
| Epoch 1 city images (15 .pngs) | Full-screen on city click | `public/cities/{id}.png` |
| Epoch 1 city names, descriptions, locations | City labels on globe + overlay text | `lib/mock-data.ts` |
| Epoch 2 mock cities (10 cities) | Fallback globe dots + city panel | `lib/mock-data.ts` |
| Epoch 3 mock cities (~12 cities) | Fallback globe dots + city panel | `lib/mock-data.ts` (NEW) |
| Epoch 4 mock cities (~12 cities) | Fallback globe dots + city panel | `lib/mock-data.ts` (NEW) |
| Globe textures, UI chrome, animations | Always | CSS + three-globe assets |
| Goal statement | Header banner, all epochs | Hardcoded constant |
| Ripple animation on intervention | After submit | Client-side requestAnimationFrame |
| Optimistic city updates on intervention | Immediate after submit | Client-side mock logic in store |

### DYNAMIC (AI-generated, has latency)

| Element | When generated | Latency | Fallback if slow |
|---------|----------------|---------|-------------------|
| World TLDR (2-3 sentences) | Part of intervention response | ~10-15s | Optimistic generic narrative |
| City causal notes ("Because you did X...") | Part of intervention response | ~10-15s | Optimistic generic note |
| Updated cities/trade routes per epoch | Part of intervention response | ~10-15s | Mock data for that epoch |
| AI world state (replaces mock) | Background after page load | ~15s | Mock data (already showing) |
| Final image (1 image, epoch 5) | Background during epoch 4 | ~10s | Loading placeholder |
| Score + analysis (epoch 5) | Background during epoch 4 | ~5s | Loading placeholder |

**Key insight:** The intervention API already returns everything needed — `worldNarrative` (world TLDR), `citiesAffected[].causalNote` (city TLDRs referencing previous decisions), updated cities. We just need the UI to surface these prominently.

---

## What the User Sees at Each Step

### Globe View (epochs 1-4, before clicking a city)
- **World TLDR** — 2-3 sentence narrative pinned at top-left, always visible (not collapsed). **DYNAMIC** — comes from `worldState.narrative`. Shows what's happening globally and references previous decisions.
- **Goal reminder** — Small text in header: "Goal: Interstellar travel by 4000 AD". **STATIC**.
- **Epoch/year indicator** — Top center. **STATIC** (from epoch config).
- **City dots on globe** — Clickable. **STATIC** (mock) initially, **DYNAMIC** (AI) swaps in.
- **Previous decisions list** — Small pills in header showing what you've done so far. **STATIC** (from store).

### City Click — Epoch 1 (full-screen immersive)
- **Full-screen preset image** — `/cities/{id}.png`. **STATIC**. 0ms.
- **City name + civilization** — Overlaid bottom-left. **STATIC** (from mock data).
- **City TLDR** — 1-2 sentence description of what's happening here. **STATIC** (from mock data `description` field).
- **Input field** — "What will you change?" at bottom. **STATIC** UI.
- Submit → ripple animation → auto-advance to epoch 2.

### City Click — Epochs 2-4 (text panel, no image)
- **City name + civilization** — Panel header. **DYNAMIC** (from AI city data).
- **City TLDR** — 1-2 sentences: what's happening in this city. **DYNAMIC** (from `city.description`).
- **Causal note** — "Because you [previous decision], [this happened here]". **DYNAMIC** (from `city.causalNote`). This is the key connection between past decisions and current state.
- **Tech level** — Visual dots. **DYNAMIC**.
- **Nearby cities** — Navigation pills. **DYNAMIC**.
- Intervention submitted via InterventionPanel at bottom.

### Epoch 5 (goal screen)
- **Final image** — AI-generated view of Earth at 4000 AD. **DYNAMIC** (pre-generated during epoch 4).
- **Score** — 0-100. **DYNAMIC**.
- **Analysis** — How the 4 decisions chained together. **DYNAMIC**.
- **Play Again button** — **STATIC**.

---

## AI Prompt Requirements

The intervention API prompt MUST instruct the AI to:

1. **Reference the specific previous decision** in every city's `causalNote`. Not generic — must say "Because you [exact intervention text], [specific effect]."
2. **Write a world narrative** (2-3 sentences) that summarizes the global state AND references how the previous decision(s) shaped it.
3. **Include the goal context** — the AI should be aware the player is trying to reach interstellar travel, so its narrative can hint at progress/setbacks toward that goal.
4. **Keep ALL text short** — city descriptions max 1 sentence, causal notes max 1 sentence, world narrative max 3 sentences. The user has ~30 seconds per epoch.

---

## File-by-File Changes

### 1. `lib/types.ts`

```typescript
EPOCHS = [
  { epoch: 1, startYear: -10000, endYear: -2000, name: "Dawn of Civilization" },
  { epoch: 2, startYear: -2000,  endYear: 1,     name: "Bronze Age" },
  { epoch: 3, startYear: 1,      endYear: 2000,  name: "Classical Era" },
  { epoch: 4, startYear: 2000,   endYear: 4000,  name: "Modern Day" },
  { epoch: 5, startYear: 4000,   endYear: 4000,  name: "The Future" },
]
```

- `currentEpoch` type: `1|2|3|4|5`
- Add `GameResult`: `{ score: number, summary: string, finalImageBase64: string | null, causalChain: string[] }`
- Add `GOAL_STATE = "Achieve interstellar travel capability by 4000 AD"`

### 2. `public/cities/` — Flatten image path

- Move `public/cities/cities/*.png` → `public/cities/*.png`
- 15 images, epoch 1 only

### 3. `lib/mock-data.ts` — Add epochs 3 & 4, add epoch lookup

- `MOCK_WORLD_STATE_1AD` — 12 cities: Rome, Alexandria, Chang'an, Antioch, Pataliputra, Carthage, Teotihuacan, Aksum, Luoyang, Petra, Londinium, Taxila
- `MOCK_WORLD_STATE_2000AD` — 12 cities: New York, London, Tokyo, Beijing, Mumbai, Sao Paulo, Lagos, Dubai, Singapore, San Francisco, Moscow, Sydney
- Trade routes and regions for each
- Export `MOCK_DATA_BY_EPOCH: Record<number, WorldState>`

### 4. `lib/store.ts` — New game flow

- `interventionsRemaining = 1` (resets to 1 each epoch)
- After intervention resolves: auto `currentEpoch++`, load mock data for new epoch, reset `interventionsRemaining = 1`
- Epoch 5: no intervention, just display results
- On epoch 4 completion: fire background `/api/score` call
- Add `gameResult: GameResult | null` to state
- `initWorld(epoch)` — loads `MOCK_DATA_BY_EPOCH[epoch]`, then background AI call to swap in real data
- Optimistic update: immediately set year + modify nearby cities + set generic narrative

### 5. `components/CityDetail.tsx` — Two modes

**Epoch 1 (full-screen):**
- `position: fixed; inset: 0; z-index: 40`
- Background: `<img src="/cities/{city.id}.png" />` covering viewport
- Gradient overlay for readability
- Bottom section: city name (large), TLDR description, input field + submit button
- On submit → calls `onSubmit(description, city.lat, city.lng)` → closes

**Epochs 2-4 (right panel, text only):**
- No image at all — just text
- City name + civilization (header)
- TLDR description (1 sentence)
- Causal note referencing previous decision (amber, italic, left-border accent)
- Tech dots
- Nearby city pills

### 6. `components/InterventionPanel.tsx`

- Only visible when `currentEpoch >= 2 && currentEpoch <= 4 && zoomedIn`
- Hidden epoch 1 (intervention built into CityDetail)
- Hidden epoch 5 (results screen)

### 7. `components/GoalScreen.tsx` — NEW

- Full-screen overlay when `currentEpoch === 5`
- Top: "Goal: Interstellar Travel by 4000 AD"
- Center: AI-generated final image (or loading spinner)
- Score: large number, color-coded
- Analysis: 3-4 sentences from AI
- Causal chain: list of 4 decisions with arrows
- "Play Again" button

### 8. `app/api/score/route.ts` — NEW

- Input: `{ interventions, worldState, goal }`
- 2 parallel Gemini calls:
  - Scoring (gemini-2.5-flash, thinkingBudget: 2048): `{ score, summary, causalChain }`
  - Final image (gemini-2.0-flash-preview-image-generation): base64 image
- Returns `GameResult`

### 9. `app/page.tsx` — Rewired flow

- Remove "Next Epoch" button entirely
- **Header**: epoch indicator + year + goal reminder + previous decisions as pills
- **World TLDR**: `worldState.narrative` displayed as always-visible panel (top-left, not collapsible)
- **Epoch 1 flow**: globe → click city → full-screen CityDetail (with embedded intervention input) → submit → ripple → auto-advance
- **Epochs 2-4 flow**: globe → world TLDR visible → click city → text panel → InterventionPanel at bottom → submit → ripple → auto-advance
- **Epoch 5**: render GoalScreen overlay
- During epoch 4 intervention: fire `/api/score` in background so results are ready for epoch 5

### 10. `lib/gemini.ts` — Updated prompts + new functions

- `processIntervention` prompt updated:
  - Include `GOAL_STATE` in context
  - Require `causalNote` to reference the EXACT previous intervention text
  - Require `worldNarrative` to mention progress toward goal
  - All text kept short (1 sentence descriptions, 3 sentence narrative)
- Add `generateScore(interventions, worldState, goal)` function
- Add `generateFinalImage(worldState, goal)` function

### 11. `components/NarrativePanel.tsx` — Simplify to world TLDR

- Rename conceptually to "World TLDR"
- Always visible (not collapsible) — just the narrative text
- Remove TTS/audio UI (not needed for 2-3 min demo)
- Show previous decisions as small list below narrative
- Keep it compact: max 3 sentences of narrative

---

## Implementation Order

| Step | What | Files | Depends On |
|------|------|-------|------------|
| 1 | Types + epochs + goal constant | `lib/types.ts` | — |
| 2 | Flatten city images | `public/cities/` | — |
| 3 | Mock data for all 4 playable epochs | `lib/mock-data.ts` | Step 1 |
| 4 | Store rewrite (1 per epoch, auto-advance, scoring) | `lib/store.ts` | Steps 1, 3 |
| 5 | CityDetail: full-screen (ep1) + text (ep2-4) | `components/CityDetail.tsx` | Step 2 |
| 6 | NarrativePanel → World TLDR (always visible) | `components/NarrativePanel.tsx` | — |
| 7 | Page.tsx: new flow + previous decisions UI | `app/page.tsx` | Steps 4, 5, 6 |
| 8 | GoalScreen component | `components/GoalScreen.tsx` | Step 1 |
| 9 | Scoring API + gemini functions | `app/api/score/route.ts`, `lib/gemini.ts` | Step 1 |
| 10 | Wire epoch 5 + background scoring into page | `app/page.tsx` | Steps 8, 9 |

---

## Latency Budget (2-3 min total game)

| Action | Target | Source | Fallback |
|--------|--------|--------|----------|
| Page load | <1s | Mock data instant | — |
| City click (epoch 1) | 0ms | Static .png from disk | — |
| City click (epochs 2-4) | 0ms | Data already in store | — |
| World TLDR visible | 0ms | `worldState.narrative` already loaded | Generic narrative |
| Intervention submit | 0ms visual | Optimistic update + ripple | — |
| Real AI result swap-in | ~10-15s | Background API | Keep optimistic state |
| Epoch transition | 0ms | Mock data loads instantly | — |
| Final image + score | Pre-generated | Started during epoch 4 | Loading spinner (max ~10s) |
