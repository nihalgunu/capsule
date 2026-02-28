import { create } from 'zustand';
import { GameState, WorldState, City, Intervention, InterventionResult, GameResult, EPOCHS, GOAL_STATE } from './types';
import { MOCK_DATA_BY_EPOCH } from './mock-data';

interface GameStore extends GameState {
  initWorld: (epoch?: number) => void;
  submitIntervention: (description: string, lat: number, lng: number) => Promise<InterventionResult | null>;
  selectCity: (city: City | null) => void;
  setZoomedIn: (zoomed: boolean, location?: { lat: number; lng: number }) => void;
  setLoading: (loading: boolean) => void;
  setGameResult: (result: GameResult) => void;
  fetchScore: (interventions: Intervention[], finalWorldState: WorldState) => Promise<void>;
  reset: () => void;
}

const initialState: GameState = {
  currentEpoch: 1,
  interventionsRemaining: 1,
  worldState: null,
  previousInterventions: [],
  loading: false,
  selectedCity: null,
  zoomedIn: false,
  zoomLocation: null,
  gameResult: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  // Load mock data for the given epoch instantly. No background AI call needed —
  // the intervention response already provides the next epoch's real data.
  initWorld: (epoch?: number) => {
    const targetEpoch = epoch ?? get().currentEpoch;
    const mockData = MOCK_DATA_BY_EPOCH[targetEpoch];
    if (mockData) {
      set({ worldState: mockData, loading: false });
    }
  },

  submitIntervention: async (description: string, lat: number, lng: number) => {
    const { worldState, previousInterventions, currentEpoch, interventionsRemaining } = get();

    if (!worldState || interventionsRemaining <= 0 || currentEpoch >= 5) {
      return null;
    }

    const epochConfig = EPOCHS[currentEpoch - 1];

    const intervention: Intervention = {
      id: `intervention-${Date.now()}`,
      description,
      lat,
      lng,
      epoch: currentEpoch,
      year: worldState.year,
    };

    const allInterventions = [...previousInterventions, intervention];

    // === OPTIMISTIC UPDATE ===
    // Advance year immediately, modify nearby cities, generic narrative.
    // The real AI result replaces this when it arrives.
    const optimisticCities = worldState.cities.map(city => {
      const isNear = Math.abs(city.lat - lat) < 20 && Math.abs(city.lng - lng) < 30;
      if (isNear) {
        return {
          ...city,
          brightness: Math.min(city.brightness + 0.2, 1),
          techLevel: Math.min(city.techLevel + 1, 10),
          change: 'brighter' as const,
          causalNote: `Affected by: ${description}`,
        };
      }
      return { ...city, change: 'unchanged' as const };
    });

    set({
      loading: true,
      interventionsRemaining: 0,
      previousInterventions: allInterventions,
      worldState: {
        ...worldState,
        year: epochConfig.endYear,
        cities: optimisticCities,
        narrative: `The world transforms as "${description}" ripples through history...`,
      },
    });

    // === REAL API CALL ===
    try {
      const response = await fetch('/api/intervene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intervention: description,
          lat,
          lng,
          currentState: worldState,
          previousInterventions: allInterventions,
          startYear: epochConfig.startYear,
          endYear: epochConfig.endYear,
        }),
      });

      if (!response.ok) throw new Error('Failed to process intervention');

      const result: InterventionResult = await response.json();

      // Build real world state from AI result
      const newWorldState: WorldState = {
        year: epochConfig.endYear,
        epoch: currentEpoch,
        cities: result.citiesAffected,
        tradeRoutes: result.tradeRoutes,
        regions: result.regions,
        narrative: result.worldNarrative,
      };

      set({
        worldState: newWorldState,
        loading: false,
        selectedCity: null,
        zoomedIn: false,
        zoomLocation: null,
      });

      // Auto-advance to next epoch after a short delay for the user to see the result
      const nextEpoch = (currentEpoch + 1) as 1 | 2 | 3 | 4 | 5;
      setTimeout(() => {
        const nextMock = MOCK_DATA_BY_EPOCH[nextEpoch];
        set({
          currentEpoch: nextEpoch,
          interventionsRemaining: nextEpoch <= 4 ? 1 : 0,
          // For epochs 2-4, load mock data immediately, real data swaps in from AI
          // For epoch 5, keep the current world state (results screen)
          worldState: nextMock ? {
            ...nextMock,
            // Carry forward the narrative from the AI so the user sees causality
            narrative: result.worldNarrative,
          } : get().worldState,
        });

        // If we just entered epoch 5, fire the scoring request
        if (nextEpoch === 5) {
          get().fetchScore(allInterventions, newWorldState);
        }
      }, 3000);

      return result;
    } catch (error) {
      console.error('Error processing intervention:', error);
      // Keep optimistic state, auto-advance with mock data
      const nextEpoch = (currentEpoch + 1) as 1 | 2 | 3 | 4 | 5;
      const nextMock = MOCK_DATA_BY_EPOCH[nextEpoch];
      setTimeout(() => {
        set({
          currentEpoch: nextEpoch,
          interventionsRemaining: nextEpoch <= 4 ? 1 : 0,
          worldState: nextMock ?? get().worldState,
          loading: false,
        });
      }, 3000);
      return null;
    }
  },

  // Background scoring — called when entering epoch 5
  fetchScore: async (interventions: Intervention[], finalWorldState: WorldState) => {
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interventions,
          worldState: finalWorldState,
          goal: GOAL_STATE,
        }),
      });
      if (response.ok) {
        const result: GameResult = await response.json();
        set({ gameResult: result });
      }
    } catch (error) {
      console.error('Error fetching score:', error);
      // Provide a fallback score
      set({
        gameResult: {
          score: 50,
          summary: "Your decisions shaped history in unexpected ways. The path to the stars remains uncertain.",
          finalImageBase64: null,
          causalChain: interventions.map(i => i.description),
        },
      });
    }
  },

  selectCity: (city: City | null) => {
    set({ selectedCity: city });
  },

  setZoomedIn: (zoomed: boolean, location?: { lat: number; lng: number }) => {
    set({ zoomedIn: zoomed, zoomLocation: location || null });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setGameResult: (result: GameResult) => {
    set({ gameResult: result });
  },

  reset: () => {
    set({ ...initialState });
  },
}));
