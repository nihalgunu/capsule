# Chronicle — Demo Gaps & TODO

Priority: latency > immersion > polish. Optimizing for 1-min demo.

## 1. Full-screen city immersion
- When a city is clicked, transition from globe to a **full-screen city view** (not a sidebar popup)
- Show a preset .png image as the hero background (full viewport)
- Overlay: city name, civilization, causal note, tech level indicator
- Nearby cities as navigation pills at the bottom
- Click-away or back button returns to globe
- The user should feel "inside" the city, not reading a tooltip

## 2. Preset city images (no compute for images)
- Add .png files to `public/cities/` keyed by city ID (e.g. `jericho.png`, `ur.png`)
- Each city in mock-data maps to a preset image — zero latency, zero compute
- Provide images for all 25 cities across both epochs (15 epoch-1 + 10 epoch-2)
- AI-generated images via Gemini are removed from the hot path entirely
- All compute budget goes to intervention reasoning + narration

## 3. Intervention should NOT jump to epoch end year
- Currently: submitting a change at 10000 BC immediately sets year to 2000 BC
- Should: world evolves and shows changes but stays within the current epoch
- Year should advance gradually (e.g. 10000 BC -> 8000 BC) based on intervention effects
- Epoch transition only happens when user clicks "Next Epoch"
- The intervention result should show what changed over a shorter time span, not the entire epoch

## 4. Render world changes during inference (streaming feel)
- When intervention is submitted, start the ripple animation immediately (already done)
- Optimistic city updates should feel progressive, not instant
- Show a subtle "History unfolding..." state (not a loading screen) while API runs
- When AI result arrives, smoothly swap in the real data
- No blocking loading screens at any point

## 5. Batch inferencing / no loading screens
- Region context, intervention, and narration should never block the UI
- Mock/optimistic data shown instantly, real data swaps in seamlessly
- Intervention API latency reduced (thinking budget capped, leaner prompts)
- All heavy compute (images, TTS) is either preset or cached
