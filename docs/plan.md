# Chronicle UI Improvement Plan

## Context
The Chronicle alternate-history globe game has a working Gemini API integration but needs UI polish: TTS audio is broken (NotSupportedError), the intro is generic, city context requires too many clicks, intervention changes aren't visually clear, and the overall flow needs simplification. This plan addresses all 5 issues in dependency order.

---

## Phase 1: Fix TTS Audio Error

**Problem**: Hardcoded `audio/wav` MIME type doesn't match Gemini's actual output (raw PCM L16 at 24kHz, not playable in browsers).

**Files**: `lib/gemini.ts`, `app/api/narrate/route.ts`, `components/NarrativePanel.tsx`

- `lib/gemini.ts`: Change `generateNarration` return type from `string` to `{ data: string; mimeType: string }` — read `part.inlineData.mimeType` from the response
- `app/api/narrate/route.ts`: If mimeType contains `L16` or `pcm`, prepend a 44-byte WAV header to the PCM buffer server-side, then return as `audio/wav`. Return `{ audioBase64, mimeType }` in the JSON response
- `components/NarrativePanel.tsx`: Read `data.mimeType` from response instead of hardcoding `audio/wav`

---

## Phase 2: Better World Intro (Replace Intro Overlay)

**Problem**: `initWorld(true)` always uses mock data. Intro is generic and auto-dismisses after 3 seconds with no real context.

**Files**: `app/page.tsx`, `lib/store.ts`

- `app/page.tsx`:
  - Change `initWorld(true)` → `initWorld(false)` to use real Gemini API
  - Replace `showIntro` state with `introPhase: 'loading' | 'ready' | 'dismissed'`
  - Remove 3-second auto-dismiss timer
  - New intro overlay shows: epoch name, year, world narrative TLDR, stats (cities/civilizations/routes), and a "Begin" button
  - Loading state shows "Generating world..." while API call runs
- `lib/store.ts`: Add 15-second AbortController timeout to `initWorld` fetch, falling back to mock data on timeout

---

## Phase 3: Enhanced City Detail Panel

**Problem**: City panel works but lacks richness. No auto-selection when zooming near a city.

**Files**: `components/CityDetail.tsx`, `app/page.tsx`

- `components/CityDetail.tsx`:
  - Accept `worldState` and `onCitySelect` as new props
  - Move causalNote above description with "What Changed" header and left-border accent
  - Add "Nearby" section showing 2-3 closest cities as clickable chips (using `getAngularDistance`)
- `app/page.tsx`:
  - Pass `worldState` and `onCitySelect` to CityDetail
  - In `handleZoomChange`: when zooming in, auto-select nearest city within 15 degrees

---

## Phase 4: Intuitive Intervention Visuals (Ripple + Animations + Summary)

**Problem**: Ripple just dims/brightens cities subtly. No post-intervention summary. Narration text hidden behind collapsed panel.

**Files**: `components/Globe.tsx`, `app/page.tsx`, `components/NarrativePanel.tsx`

- `components/Globe.tsx`:
  - Add wave-band effect: cities just behind the ripple front get scaled (1.8x for brighter/new, 0.4x for dimmer/gone)
  - Accept `milestones` prop, render via `htmlElementsData` layer as text labels at coordinates, filtered by ripple progress
- `app/page.tsx`:
  - Store `lastResult` and `showSummary` state
  - After ripple completes, show a summary toast (bottom-center) with key changes: new cities, flourishing, declining counts
  - Auto-dismiss after 6 seconds or on click
  - Pass `milestones` to Globe component
- `components/NarrativePanel.tsx`:
  - Auto-expand panel when narrationScript arrives (`useEffect` sets `isExpanded = true`)
  - Show narration script text visibly in the panel (not just audio), even while audio loads

---

## Phase 5: UI Cleanup — Less Clicking

**Problem**: Too much visual clutter, intervention panel too tall, flow not obvious.

**Files**: `components/InterventionPanel.tsx`, `lib/store.ts`

- `components/InterventionPanel.tsx`:
  - Reduce vertical padding (`pt-16 pb-6` → `pt-8 pb-4`)
  - Add `line-clamp-2` to region description
  - Add slide-up entrance animation
- `lib/store.ts`: Clear `selectedCity: null` in `submitIntervention` set() call so city panel auto-closes after intervention

---

## Implementation Order
1. Phase 1 (TTS fix) — standalone bug fix
2. Phase 2 (intro overlay) — sets up real-API pattern
3. Phase 3 (city detail) — independent UI enhancement
4. Phase 4 (animations + summary) — builds on stable Phases 1-3
5. Phase 5 (cleanup) — final polish

## Verification
- Run `npm run dev`, open http://localhost:3000
- Verify intro card shows with real Gemini-generated world data and "Begin" button
- Click a city → verify enriched right panel with causal notes and nearby cities
- Zoom in → verify nearest city auto-selects
- Submit an intervention → verify ripple with wave-band city scaling, milestone labels, and post-intervention summary toast
- Verify TTS audio plays without console errors
- Verify narration text is visible in the expanded narrative panel
