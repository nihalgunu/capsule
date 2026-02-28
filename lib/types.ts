// Chronicle: Core TypeScript Interfaces

export interface WorldState {
  year: number;
  epoch: 1 | 2 | 3 | 4;
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
  population: number;      // Maps to dot size (100-50000)
  brightness: number;      // 0-1, maps to glow intensity
  techLevel: number;       // 1-10, maps to color (amber→white)
  civilization: string;
  description: string;
  causalNote?: string;     // "Because you did X..."
  change?: "brighter" | "dimmer" | "new" | "gone" | "unchanged";
  imagePrompt?: string;    // For top 3 hero cities only
}

export interface TradeRoute {
  id: string;
  from: { lat: number; lng: number; city: string };
  to: { lat: number; lng: number; city: string };
  volume: number;          // Maps to arc thickness (1-10)
  description: string;
  causalNote?: string;
}

export interface Region {
  id: string;
  civilization: string;
  color: string;           // Hex color for territory shading
  center: { lat: number; lng: number };
  radius: number;          // Rough territory size in degrees
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
  epoch: 1 | 2 | 3 | 4;
  year: number;
}

export interface InterventionResult {
  milestones: Milestone[];
  citiesAffected: City[];
  tradeRoutes: TradeRoute[];
  regions: Region[];
  worldNarrative: string;
  narrationScript: string;  // 4-6 sentences for TTS
  mostSurprising: {
    lat: number;
    lng: number;
    description: string;
    causalChain: string[];
    imagePrompt: string;
  };
}

export interface RegionContext {
  description: string;
  suggestions: {
    text: string;
    reasoning: string;
  }[];
}

export interface GameState {
  currentEpoch: 1 | 2 | 3 | 4;
  interventionsRemaining: number;  // Starts at 4
  worldState: WorldState | null;
  previousInterventions: Intervention[];
  loading: boolean;
  audioPlaying: boolean;
  voiceSessionActive: boolean;
  selectedCity: City | null;
  zoomedIn: boolean;
  zoomLocation: { lat: number; lng: number } | null;
}

// Epoch configuration
export const EPOCHS = [
  { epoch: 1, startYear: -10000, endYear: -2000, name: "Agricultural Revolution" },
  { epoch: 2, startYear: -2000, endYear: 0, name: "Classical Civilizations" },
  { epoch: 3, startYear: 0, endYear: 2000, name: "Modern Era" },
  { epoch: 4, startYear: 2000, endYear: 4000, name: "Future" },
] as const;

// Helper to format year display
export function formatYear(year: number): string {
  if (year < 0) {
    return `${Math.abs(year)} BC`;
  } else if (year === 0) {
    return "1 AD";
  } else {
    return `${year} AD`;
  }
}

// Helper to get city color based on tech level
export function getCityColor(techLevel: number): string {
  const colors = [
    '#4a3000', // 1: barely visible
    '#6b4400', // 2
    '#8b6914', // 3
    '#b8860b', // 4: bronze age
    '#daa520', // 5: classical
    '#f0c040', // 6: medieval
    '#f5d060', // 7: renaissance
    '#fae080', // 8: early modern
    '#fff4c0', // 9: industrial
    '#ffffff', // 10: space age
  ];
  return colors[Math.min(Math.max(techLevel - 1, 0), 9)];
}

// Helper to calculate angular distance between two points
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

  return c * 180 / Math.PI; // Return in degrees
}
