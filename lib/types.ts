// Chronicle: Core TypeScript Interfaces

export const GOAL_STATE = "Achieve interstellar travel capability by 4000 AD";

export interface WorldState {
  year: number;
  epoch: 1 | 2 | 3 | 4 | 5;
  cities: City[];
  tradeRoutes: TradeRoute[];
  regions: Region[];
  narrative: string;
}

export interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
  population: number;
  brightness: number;      // 0-1
  techLevel: number;       // 1-10
  civilization: string;
  description: string;
  pros?: string;           // Strategic advantages (epoch 1 selection)
  cons?: string;           // Challenges (epoch 1 selection)
  causalNote?: string;     // "Because you did X..."
  change?: "brighter" | "dimmer" | "new" | "gone" | "unchanged";
}

export interface TradeRoute {
  id: string;
  from: { lat: number; lng: number; city: string };
  to: { lat: number; lng: number; city: string };
  volume: number;
  description: string;
}

export interface Region {
  id: string;
  civilization: string;
  color: string;
  center: { lat: number; lng: number };
  radius: number;
}

export interface Milestone {
  year: number;
  lat: number;
  lng: number;
  event: string;
  causalLink: string;
}

export interface Intervention {
  id: string;
  description: string;
  lat: number;
  lng: number;
  epoch: 1 | 2 | 3 | 4 | 5;
  year: number;
}

export interface InterventionResult {
  milestones: Milestone[];
  citiesAffected: City[];
  tradeRoutes: TradeRoute[];
  regions: Region[];
  worldNarrative: string;
  narrationScript: string;
  mostSurprising: {
    lat: number;
    lng: number;
    description: string;
    causalChain: string[];
  };
}

export interface GameResult {
  score: number;            // 0-100
  summary: string;          // AI analysis
  finalImageBase64: string | null;
  causalChain: string[];    // How the 4 decisions connected
}

export interface RegionContext {
  description: string;
  suggestions: {
    text: string;
    reasoning: string;
  }[];
}

export interface GameState {
  currentEpoch: 1 | 2 | 3 | 4 | 5;
  interventionsRemaining: number;
  worldState: WorldState | null;
  previousInterventions: Intervention[];
  loading: boolean;
  selectedCity: City | null;
  chosenCity: City | null;           // Locked in during epoch 1, persists all game
  gameResult: GameResult | null;
}

// Epoch configuration
export const EPOCHS = [
  { epoch: 1, startYear: -10000, endYear: -2000, name: "Dawn of Civilization" },
  { epoch: 2, startYear: -2000, endYear: 1, name: "Bronze Age" },
  { epoch: 3, startYear: 1, endYear: 2000, name: "Classical Era" },
  { epoch: 4, startYear: 2000, endYear: 4000, name: "Modern Day" },
  { epoch: 5, startYear: 4000, endYear: 4000, name: "The Future" },
] as const;

export function formatYear(year: number): string {
  if (year < 0) {
    return `${Math.abs(year)} BC`;
  } else if (year === 0) {
    return "1 AD";
  } else {
    return `${year} AD`;
  }
}

export function getCityColor(techLevel: number): string {
  const colors = [
    '#4a3000', '#6b4400', '#8b6914', '#b8860b', '#daa520',
    '#f0c040', '#f5d060', '#fae080', '#fff4c0', '#ffffff',
  ];
  return colors[Math.min(Math.max(techLevel - 1, 0), 9)];
}

export function getAngularDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return c * 180 / Math.PI;
}
