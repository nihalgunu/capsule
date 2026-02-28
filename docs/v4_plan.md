# Chronicle v4 — Polish Fixes

---

### 1. Static Year Display During Narrative
- **Problem**: After submitting an intervention (e.g., 10,000 BC → 2,000 BC), the year counter shows an intermediate value like 8,000 BC while the narrative TLDR is already describing 2,000 BC. This is confusing.
- **Fix**: When the API resolves and the new narrative appears, snap the year counter immediately to the epoch's end year. The animated year counter should only tick during the loading phase. Once results are in and the narrative is visible, the year must be static and accurate.
- **Files**: `YearCounter.tsx`, `page.tsx`, `store.ts`

### 2. Uniform City Size on Globe
- **Problem**: Cities have different point sizes based on population, making some nearly invisible.
- **Fix**: Set all city points to the same fixed radius. Remove the `Math.sqrt(population)` scaling. Keep the highlight (larger + white) for the selected/chosen city.
- **Files**: `Globe.tsx`

### 3. Better TTS Voice
- **Problem**: The current speechSynthesis voice sounds choppy and robotic.
- **Fix**: Enumerate available voices on load and pick a high-quality English voice (prefer "Google UK English Female", "Samantha", "Karen", or similar). Fall back to the default if none found. Also lower the rate slightly for smoother delivery.
- **Files**: `NarrativePanel.tsx`

### 4. Hover Tooltip on Cities After Intervention
- **Problem**: After making a change, the user can't see how other cities were affected without clicking into them. In epochs 2-4, clicking is disabled.
- **Fix**: Re-enable `pointLabel` on the globe to show a hover tooltip with the city's `causalNote` (e.g., "Because you introduced irrigation, this city's farming output doubled"). Keep it lightweight — just name + causalNote. Hovering works in all epochs, clicking only in epoch 1.
- **Files**: `Globe.tsx`

---

## Implementation

| Step | What | Files |
|------|------|-------|
| 1 | Snap year to endYear when API resolves | `page.tsx`, `store.ts` |
| 2 | Fixed city point radius | `Globe.tsx` |
| 3 | Select better TTS voice | `NarrativePanel.tsx` |
| 4 | Add hover causalNote tooltips back | `Globe.tsx` |
