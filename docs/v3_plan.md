# Chronicle v3 — Polish & UX Fixes

## Issues Found in v2 Testing

---

### 1. Cities Too Dim on Globe
- City points are barely visible on the dark globe
- Need significantly brighter, larger points
- Should be immediately obvious where cities are

### 2. Hover Tooltips Are Bad UX
- Hovering over tiny city points to see info is frustrating
- Remove hover tooltips — city info is shown in the full-screen view (epoch 1) or side panel (epochs 2-4)
- Keep hover cursor change so user knows cities are clickable

### 3. Epoch 1 City Browsing: Next/Prev Arrows
- Current: user must click tiny dots on the globe to browse cities
- **New**: Add **next/prev arrow buttons** overlaid on the full-screen city view
- User clicks a city → full-screen view → arrows to cycle through all 15 cities
- Much easier to browse than hunting for dots on a globe
- Keep globe click as an entry point, but arrows are the primary navigation

### 4. Year Display Inaccurate
- After submitting in epoch 1, year shows 8000 BC instead of the correct year
- Year counter must always reflect the **actual current year** accurately
- On epoch transition, immediately snap to the new epoch's start year

### 5. Narration Feature (TTS)
- After AI calculates changes for an epoch, **narrate the TLDR** of what changed
- User can listen and understand context for their next move
- Use browser speech synthesis (`speechSynthesis` API) — zero latency, no extra API
- Short narration: 2-3 sentences max from the `worldNarrative` or `narrationScript`
- Auto-play when new epoch loads, with a mute toggle

### 6. Timeline Animation Matches Loading Speed
- Current: year counter animates on a fixed 4-5s timer, disconnects from actual load time
- **New**: Year counter animation duration = actual API response time
- If API takes 45s → year ticks from 10,000 BC to 2,000 BC over 45s
- If API takes 10s → year ticks over 10s
- Start animation when intervention is submitted
- End animation when API response arrives
- Smooth eased interpolation throughout

### 7. Globe Slow Spin During Loading
- While waiting for API response, globe should slowly auto-rotate
- Visual indicator that something is happening
- Stop/slow down rotation once response arrives

### 8. Don't Auto-Jump to Final Screen After Epoch 4
- Current: after epoch 4 intervention, auto-advances to GoalScreen after 3s
- **New**: Show the epoch 4 results (world state at 2000 AD / 4000 AD) normally
- User sees the world, reads the narrative, understands the outcome
- A **"See Your Results"** button appears (only when image is ready)
- User clicks button → transitions to final screen

### 9. Start Image Generation Early (at Epoch 3)
- Begin generating the final image when user submits their epoch 3 (1 AD) intervention
- By the time they finish epoch 4, the image should be ready or nearly ready
- Hides ~10-15s of latency behind gameplay

### 10. Final Screen Formatting
- **Must fit entirely on one viewport** — no scrolling
- Image as full-screen background (opacity overlay)
- Score (large, centered)
- Brief reasoning overlay (2-3 sentences, not a long list)
- "Play Again" button visible without scrolling
- Layout: vertically centered, compact

---

## File-by-File Changes

### `components/Globe.tsx`
- **Brighter cities**: increase `pointRadius` base size, increase `brightness` floor (min 0.4)
- **Remove hover labels**: remove `pointLabel` prop entirely (no tooltips)
- **Keep click cursor**: keep `onPointClick` for epoch 1
- **Loading spin**: increase `autoRotateSpeed` during loading state

### `components/CityDetail.tsx` (Epoch 1)
- **Add next/prev arrows**: overlay `←` and `→` buttons on full-screen city view
- Cycle through all epoch 1 cities array
- Show current index: "3 / 15"
- Arrows wrap around (last → first)

### `components/YearCounter.tsx`
- **Dynamic animation duration**: accept a `isLoading` flag
- When loading starts: begin animating from current year toward target year
- When loading ends (API returns): snap to final year
- Animation speed = smooth interpolation that lasts until API responds
- Fix: ensure year is always accurate to current epoch

### `components/NarrativePanel.tsx`
- **Add TTS**: when new narrative arrives, auto-speak it via `speechSynthesis`
- Mute toggle button (speaker icon)
- Only narrate on epoch transitions, not on initial load

### `app/page.tsx`
- **Remove auto-advance to epoch 5**: after epoch 4, stay on the game view
- Add "See Your Results" button (bottom-center, styled prominently)
- Button disabled/hidden until `gameResult?.finalImageBase64` is ready
- **Start image generation at epoch 3**: trigger early image gen when epoch 3 intervention is submitted
- Pass `isLoading` to YearCounter for dynamic animation
- Pass loading state to Globe for spin speed

### `lib/store.ts`
- **Early image generation**: add `startEarlyImageGen()` method
- Called after epoch 3 intervention resolves
- Stores the image promise; epoch 5 screen awaits it
- Add `finalImageReady: boolean` to state
- **Remove auto-advance to epoch 5**: epoch 4 completion stays on epoch 4 view

### `components/GoalScreen.tsx`
- **Viewport-fit layout**: `h-screen` with flex column, everything centered
- No overflow/scroll — score + 2-3 sentence summary + Play Again, all above fold
- Image as full background with overlay
- Compact: remove causal chain list (just keep summary text)
- "Play Again" button always visible

### `app/api/score/route.ts`
- Accept optional `earlyImageOnly` flag for pre-generating image at epoch 3
- Return partial result (just image) when called early

---

## Implementation Order

| Step | What | Files |
|------|------|-------|
| 1 | Brighter cities + remove hover labels | `Globe.tsx` |
| 2 | Next/prev arrows for epoch 1 city browsing | `CityDetail.tsx` |
| 3 | Fix year display accuracy | `YearCounter.tsx`, `store.ts` |
| 4 | Dynamic timeline animation (match API speed) | `YearCounter.tsx`, `page.tsx` |
| 5 | Globe spin during loading | `Globe.tsx`, `page.tsx` |
| 6 | TTS narration on epoch transition | `NarrativePanel.tsx` |
| 7 | Remove auto-jump to final screen, add button | `store.ts`, `page.tsx` |
| 8 | Early image generation at epoch 3 | `store.ts`, `page.tsx` |
| 9 | Fix final screen layout (viewport-fit) | `GoalScreen.tsx` |
