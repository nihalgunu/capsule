import { create } from 'zustand';
import { GameState, WorldState, City, Intervention, InterventionResult, GameResult, EPOCHS, GOAL_STATE } from './types';
import { MOCK_DATA_BY_EPOCH } from './mock-data';

interface GameStore extends GameState {
  initWorld: (epoch?: number) => void;
  submitIntervention: (description: string) => Promise<InterventionResult | null>;
  selectCity: (city: City | null) => void;
  setChosenCity: (city: City) => void;
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
  chosenCity: null,
  gameResult: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  initWorld: (epoch?: number) => {
    const targetEpoch = epoch ?? get().currentEpoch;
    const mockData = MOCK_DATA_BY_EPOCH[targetEpoch];
    if (mockData) {
      set({ worldState: mockData, loading: false });
    }
  },

  // Lock in a city during epoch 1
  setChosenCity: (city: City) => {
    set({ chosenCity: city });
  },

  submitIntervention: async (description: string) => {
    const { worldState, previousInterventions, currentEpoch, interventionsRemaining, chosenCity } = get();

    if (!worldState || interventionsRemaining <= 0 || currentEpoch >= 5 || !chosenCity) {
      return null;
    }

    const lat = chosenCity.lat;
    const lng = chosenCity.lng;
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
      selectedCity: null,
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
          chosenCity: { name: chosenCity.name, civilization: chosenCity.civilization },
          startYear: epochConfig.startYear,
          endYear: epochConfig.endYear,
        }),
      });

      if (!response.ok) throw new Error('Failed to process intervention');

      const result: InterventionResult = await response.json();

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
      });

      // Auto-advance to next epoch after short delay
      const nextEpoch = (currentEpoch + 1) as 1 | 2 | 3 | 4 | 5;
      setTimeout(() => {
        const nextMock = MOCK_DATA_BY_EPOCH[nextEpoch];
        set({
          currentEpoch: nextEpoch,
          interventionsRemaining: nextEpoch <= 4 ? 1 : 0,
          worldState: nextMock ? {
            ...nextMock,
            narrative: result.worldNarrative,
          } : get().worldState,
        });

        if (nextEpoch === 5) {
          get().fetchScore(allInterventions, newWorldState);
        }
      }, 3000);

      return result;
    } catch (error) {
      console.error('Error processing intervention:', error);
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

  fetchScore: async (interventions: Intervention[], finalWorldState: WorldState) => {
    const { chosenCity } = get();
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interventions,
          worldState: finalWorldState,
          goal: GOAL_STATE,
          chosenCity: chosenCity ? { name: chosenCity.name, civilization: chosenCity.civilization } : null,
        }),
      });
      if (response.ok) {
        const result: GameResult = await response.json();
        set({ gameResult: result });
      }
    } catch (error) {
      console.error('Error fetching score:', error);
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
