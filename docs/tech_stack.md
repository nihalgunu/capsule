# Chronicle — Tech Stack Documentation

A comprehensive guide to every layer of the Chronicle application: an AI-powered alternate-history strategy game built on the Capsule consequence-modeling engine.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Framework](#core-framework)
3. [Project Structure](#project-structure)
4. [Frontend](#frontend)
5. [State Management](#state-management)
6. [3D Globe & Visualization](#3d-globe--visualization)
7. [AI / Gemini Integration](#ai--gemini-integration)
8. [API Routes](#api-routes)
9. [Audio System](#audio-system)
10. [Styling & Animations](#styling--animations)
11. [Build Tooling & Configuration](#build-tooling--configuration)
12. [Environment Variables](#environment-variables)
13. [Deployment](#deployment)
14. [Data Flow](#data-flow)

---

## Overview

Chronicle lets players navigate a 3D globe spanning 6,000 years of human history (10,000 BC → 4,000 AD). Players select a city at the dawn of civilization, then make 4 strategic interventions across epochs. Google Gemini models the causal consequences — how a single change ripples across continents and millennia — and scores decisions against a goal (achieving interstellar travel by 4,000 AD).

**Underlying engine ("Capsule"):** A consequence-modeling system that loads full world state into Gemini's context window, applies natural-language interventions, reasons through causal chains, and returns an updated world with full traceability.

---

## Core Framework

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Package Manager | npm | — |

- **App Router** — all pages and API routes live under `app/`.
- **Strict TypeScript** — enabled in `tsconfig.json` with path alias `@/*` mapping to the project root.
- **Target:** ES2017, module resolution set to `bundler`.

---

## Project Structure

```
capsule/
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout (fonts, metadata)
│   ├── page.tsx                    # Main game view (client component)
│   ├── globals.css                 # Tailwind + custom animations
│   ├── favicon.ico
│   └── api/
│       ├── generate-world/route.ts # Generate epoch world state
│       ├── intervene/route.ts      # Process player intervention
│       ├── generate-image/route.ts # AI image of future Earth
│       ├── score/route.ts          # Calculate final score
│       └── tts/route.ts           # Text-to-speech narration
│
├── components/                     # React components
│   ├── Globe.tsx                   # 3D interactive globe
│   ├── CityDetail.tsx              # City info + intervention input
│   ├── YearCounter.tsx             # Animated year counter
│   ├── NarrativePanel.tsx          # World summary + TTS narration
│   ├── GoalScreen.tsx              # Final results / scoring screen
│   └── AmbientMusic.tsx            # Procedural Web Audio synth
│
├── lib/                            # Shared logic
│   ├── types.ts                    # Core TypeScript interfaces
│   ├── store.ts                    # Zustand game store
│   ├── gemini.ts                   # Gemini API wrappers
│   ├── mock-data.ts                # Fallback data (no API key)
│   └── prompts.ts                  # Prompt templates
│
├── landing-page/
│   └── index.html                  # Standalone static landing page
│
├── public/                         # Static assets
├── docs/                           # Documentation
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
└── .env.local                      # API keys (gitignored)
```

---

## Frontend

### Page Architecture

The app is a single-page client component (`app/page.tsx`) that renders different views based on game state:

1. **City Selection** (Epoch 1) — full-screen immersive view where the player browses cities on the globe and locks in a home city for the entire game. Each city shows pros/cons to inform the strategic choice.
2. **Epoch Gameplay** (Epochs 1–4) — globe view with city details panel, intervention text input, and narrative summary. The player submits one intervention per epoch.
3. **Ripple Visualization** — after each intervention, an animated ripple wave radiates outward from the intervention point. Cities brighten or dim based on impact. Milestone markers appear on the globe showing key historical events.
4. **Results Screen** (Epoch 5) — AI-generated image of Earth at 4,000 AD, final score (0–100), causal chain breakdown, and summary.

### Key Components

| Component | Purpose |
|-----------|---------|
| `Globe.tsx` | 3D Earth rendered with `react-globe.gl`. Handles city points, trade route arcs, milestone labels, ripple effects, auto-rotation, and fly-to animations. Dynamically imported with `ssr: false`. |
| `CityDetail.tsx` | Slide-in panel showing selected city info (population, tech level, description) and a text input for interventions. |
| `YearCounter.tsx` | Animated year display using exponential decay (tau = 25,000ms). Snaps to the final year when the API resolves. |
| `NarrativePanel.tsx` | Displays world TLDR text and triggers TTS narration via the `/api/tts` endpoint. |
| `GoalScreen.tsx` | Final screen with score, summary, causal chain analysis, and AI-generated image background. |
| `AmbientMusic.tsx` | Procedural ambient music synthesizer using the Web Audio API. |

### Fonts

- **Geist Sans** and **Geist Mono** loaded via `next/font/google` in `app/layout.tsx`.
- Landing page uses **JetBrains Mono**, **Instrument Sans**, and **Instrument Serif**.

---

## State Management

**Library:** Zustand 5.x
**Store:** `lib/store.ts`

### GameStore Shape

```typescript
interface GameStore {
  currentEpoch: number;           // 1–5
  interventionsRemaining: number; // decrements with each intervention
  worldState: WorldState | null;  // current world data
  previousInterventions: Array;   // history of player actions
  loading: boolean;               // API call in progress
  selectedCity: City | null;      // currently browsing
  chosenCity: City | null;        // locked in at epoch 1, persists all game
  gameResult: GameResult | null;  // final score/summary
  earlyImageBase64: string | null;// AI-generated image (prefetched)
}
```

### Key Actions

| Action | What It Does |
|--------|-------------|
| `initWorld()` | Calls `/api/generate-world` for the current epoch |
| `submitIntervention()` | Sends intervention to `/api/intervene`, updates world state |
| `selectCity()` | Sets the currently viewed city |
| `generateEarlyImage()` | Fires after epoch 3 to prefetch the final image in the background |
| `advanceToResults()` | Transitions to the results screen |
| `fetchScore()` | Calls `/api/score` to calculate final score |
| `reset()` | Returns to epoch 1, clears all state |

### Core Types (`lib/types.ts`)

- **WorldState** — cities, trade routes, regions, TLDR summary
- **City** — name, lat/lng, population, techLevel, description, causalNote
- **Intervention** — epoch, description, lat/lng, result
- **InterventionResult** — milestones, affected cities, new world state, narrative
- **GameResult** — score (0–100), summary, causal chain
- **Epoch Config** — 5 periods: 10,000 BC → 2,000 BC → 1 AD → 2,000 AD → 4,000 AD

---

## 3D Globe & Visualization

**Libraries:**
- `react-globe.gl` (v2.37.0) — React wrapper around `globe.gl`
- `three` (v0.183.2) — underlying 3D engine

### Globe Features

- **City Points** — colored by tech level (brightness), sized by population
- **Trade Route Arcs** — curved lines connecting trading cities
- **Milestone Markers** — HTML overlay labels during ripple animation
- **Ring Pulse Effects** — highlight rings on affected cities
- **Auto-Rotation** — faster while loading, pausable on user interaction
- **Fly-To Animations** — smooth camera transitions to selected cities
- **Hover Tooltips** — city name and causal chain info on hover
- **Night Sky Background** — texture loaded from Three.js CDN

### Ripple Animation

After an intervention is submitted:
1. A `requestAnimationFrame` loop radiates outward from the intervention point
2. Cities within the ripple radius brighten or dim based on the AI's impact assessment
3. Milestone labels appear at geographic locations as the ripple passes
4. Uses Haversine-like angular distance calculation (`getAngularDistance()`)
5. Exponential easing for smooth wave propagation

### Dynamic Import

```typescript
const GlobeGL = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => <div>Loading Globe...</div>
});
```

Globe is client-only because Three.js requires a browser DOM/WebGL context.

---

## AI / Gemini Integration

**Service:** Google Gemini API
**Client:** `@google/genai` (v1.43.0)
**Config:** `lib/gemini.ts`

### Models Used

| Model | Purpose |
|-------|---------|
| `gemini-2.5-flash` | World generation, intervention simulation, scoring (reasoning tasks) |
| `gemini-3-pro-image-preview` | AI image generation of future Earth |
| `gemini-2.5-flash-preview-tts` | Text-to-speech narration |

### AI Functions

#### `generateWorld(epoch, startYear)`
- Generates 12–15 cities, 4–6 trade routes, 4–6 regions for a given epoch
- Returns structured JSON (`WorldState`)
- Config: JSON response mode, 1,024 token thinking budget

#### `processIntervention(intervention, lat, lng, currentState, previousInterventions, ...)`
- Simulates historical consequences of a player's natural-language intervention
- Traces full causal chains: how one change ripples across time and geography
- Returns `InterventionResult` with milestones, affected cities, and narrative
- Config: JSON mode, 16,384 max output tokens, 2,048 thinking budget
- Includes strict formatting constraints (year formatting, causal note requirements)

#### `generateScore(interventions, worldState, goal, chosenCity)`
- Evaluates how well the player's 4 decisions contributed to the goal
- Returns score (0–100), 3–4 sentence summary, and causal chain breakdown

#### `generateFinalImage(worldState, goal, chosenCity)`
- Generates a cinematic render of Earth at 4,000 AD in the player's alternate timeline
- Returns base64-encoded PNG

### Prompt Engineering

Prompts are centralized in `lib/prompts.ts` with:
- Explicit JSON schema definitions for structured output
- Formatting rules (e.g., "Use 'X BC' not '-X BC'")
- Causal chain requirements ("Every city causalNote MUST reference exact previous intervention")
- Context injection of full world state and intervention history

### Mock Data Fallback

If `GEMINI_API_KEY` is missing, all API routes fall back to `lib/mock-data.ts` which provides realistic pre-built world states for the first 3 epochs. This enables development without API costs.

---

## API Routes

All routes live under `app/api/` and follow Next.js Route Handler conventions.

| Endpoint | Method | Input | Output |
|----------|--------|-------|--------|
| `/api/generate-world` | POST | `{ epoch, startYear }` | `WorldState` JSON |
| `/api/intervene` | POST | `{ intervention, lat, lng, worldState, previousInterventions, epoch, ... }` | `InterventionResult` JSON |
| `/api/generate-image` | POST | `{ worldState, goal, chosenCity }` | `{ image: base64string }` |
| `/api/score` | POST | `{ interventions, worldState, goal, chosenCity }` | `{ score, summary, causalChain }` |
| `/api/tts` | POST | `{ text }` | Binary WAV audio (24kHz, 16-bit, mono) |

### TTS Route Details

The TTS route deserves special mention — it:
1. Sends text to Gemini's TTS model with the "Kore" voice
2. Receives raw PCM audio data
3. Wraps it in a proper WAV header (RIFF format, 24kHz sample rate, 16-bit depth, mono)
4. Returns the complete WAV file as binary

---

## Audio System

### Ambient Music (`components/AmbientMusic.tsx`)

A fully procedural synthesizer built on the **Web Audio API** (no audio files):

- **Bass Layer** — C1 sine oscillator (deep rumble)
- **Mid Chord** — C3, E3, G3 oscillators with gentle filtering
- **Sparkle Layer** — C5, G5 high-frequency shimmer
- **Noise Texture** — filtered white noise for atmosphere
- **LFO Modulation** — low-frequency oscillator for organic movement
- **Volume Ducking** — automatically lowers during TTS narration

Starts on first user interaction to comply with browser autoplay policies.

### TTS Narration (`components/NarrativePanel.tsx`)

- Triggered when narrative text changes (new epoch or intervention result)
- Fetches audio from `/api/tts`
- Creates `Blob` → `ObjectURL` → `Audio` element
- Abortable if narrative changes mid-playback
- Volume set to 0.8

---

## Styling & Animations

### Tailwind CSS 4

- Configured via `postcss.config.mjs` with `@tailwindcss/postcss`
- Global styles in `app/globals.css` using `@import "tailwindcss"` (v4 syntax)
- Color scheme: amber/gold theme on black background
- Dark aesthetic throughout

### Custom CSS Animations

Defined in `globals.css`:

| Animation | Effect |
|-----------|--------|
| `fade-in` | Opacity 0→1 + translateY upward |
| `slide-up` | Opacity 0→1 + translateY upward |
| `slide-in` | Opacity 0→1 + translateX (city detail panel entrance) |

### JavaScript Animations

| Animation | Location | Technique |
|-----------|----------|-----------|
| Ripple wave | `Globe.tsx` | `requestAnimationFrame` loop with exponential easing |
| Year counter | `YearCounter.tsx` | Exponential decay (tau = 25,000ms), snaps on resolve |
| Globe rotation | `Globe.tsx` | Three.js built-in auto-rotate with variable speed |
| City brightness | `Globe.tsx` | Dynamic color interpolation during ripple |

---

## Build Tooling & Configuration

### Build Commands

```bash
npm run dev           # Next.js dev server on :3000
npm run dev:landing   # Serve landing page on :3001 via npx serve
npm run dev:all       # Run both concurrently
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint
```

### Next.js Config (`next.config.ts`)

Minimal — empty config object. Defaults to Turbopack for dev builds in Next.js 16.

### TypeScript Config (`tsconfig.json`)

- Strict mode enabled
- Path alias: `@/*` → project root
- Incremental compilation
- Target: ES2017

### ESLint (`eslint.config.mjs`)

- ESLint v9 flat config format
- Extends `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API authentication | No (falls back to mock data) |

Stored in `.env.local` (gitignored). No other environment variables needed.

---

## Deployment

**Target:** Vercel (Next.js native platform)

- Zero-config deployment — Next.js App Router is Vercel's first-class citizen
- API routes deploy as serverless functions
- Static assets served from Vercel's edge network
- Landing page can be served separately or integrated

---

## Data Flow

The application has no database. All state lives in the client-side Zustand store for the duration of a session.

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐  │
│  │  Globe    │◄───│  Zustand  │───►│  CityDetail /    │  │
│  │  (Three)  │    │  Store    │    │  NarrativePanel  │  │
│  └──────────┘    └────┬─────┘    └──────────────────┘  │
│                       │                                  │
└───────────────────────┼──────────────────────────────────┘
                        │ HTTP POST
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  SERVER (Next.js API Routes)             │
│                                                         │
│  /api/generate-world  ──►  gemini.generateWorld()       │
│  /api/intervene       ──►  gemini.processIntervention() │
│  /api/generate-image  ──►  gemini.generateFinalImage()  │
│  /api/score           ──►  gemini.generateScore()       │
│  /api/tts             ──►  Gemini TTS model             │
│                                                         │
│  (Falls back to mock-data.ts if no API key)             │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   GOOGLE GEMINI API                      │
│                                                         │
│  gemini-2.5-flash          → reasoning (world, score)   │
│  gemini-3-pro-image-preview → image generation          │
│  gemini-2.5-flash-preview-tts → text-to-speech          │
└─────────────────────────────────────────────────────────┘
```

### Session Lifecycle

1. **Init** — `initWorld()` generates epoch 1 world state
2. **Select City** — player browses globe, locks in a city
3. **Intervene** (×4) — player types intervention → AI processes → world updates → ripple animates
4. **Prefetch Image** — after epoch 3, image generation starts in background
5. **Score** — `/api/score` evaluates all 4 interventions against the goal
6. **Results** — display score, summary, causal chain, and AI-generated Earth image
7. **Reset** — return to epoch 1, all state cleared
