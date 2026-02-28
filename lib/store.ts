// Chronicle: Zustand Game State Store
import { create } from 'zustand';
import { GameState, WorldState, City, Intervention, InterventionResult, EPOCHS } from './types';
import { MOCK_WORLD_STATE_10000BC } from './mock-data';

interface GameStore extends GameState {
  // Actions
  initWorld: (useMock?: boolean) => Promise<void>;
  submitIntervention: (description: string, lat: number, lng: number) => Promise<InterventionResult | null>;
  selectCity: (city: City | null) => void;
  setZoomedIn: (zoomed: boolean, location?: { lat: number; lng: number }) => void;
  setLoading: (loading: boolean) => void;
  setAudioPlaying: (playing: boolean) => void;
  setVoiceSessionActive: (active: boolean) => void;
  updateWorldState: (state: WorldState) => void;
  nextEpoch: () => void;
  reset: () => void;
}

const initialState: GameState = {
  currentEpoch: 1,
  interventionsRemaining: 4,
  worldState: null,
  previousInterventions: [],
  loading: false,
  audioPlaying: false,
  voiceSessionActive: false,
  selectedCity: null,
  zoomedIn: false,
  zoomLocation: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  initWorld: async (useMock = false) => {
    set({ loading: true });

    try {
      if (useMock) {
        // Use mock data for development
        set({
          worldState: MOCK_WORLD_STATE_10000BC,
          loading: false,
        });
        return;
      }

      // Call the API to generate the initial world
      const response = await fetch('/api/generate-world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          epoch: 1,
          startYear: -10000,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate world');
      }

      const worldState: WorldState = await response.json();
      set({ worldState, loading: false });
    } catch (error) {
      console.error('Error initializing world:', error);
      // Fall back to mock data on error
      set({
        worldState: MOCK_WORLD_STATE_10000BC,
        loading: false,
      });
    }
  },

  submitIntervention: async (description: string, lat: number, lng: number) => {
    const { worldState, previousInterventions, currentEpoch, interventionsRemaining } = get();

    if (!worldState || interventionsRemaining <= 0) {
      return null;
    }

    set({ loading: true });

    const intervention: Intervention = {
      id: `intervention-${Date.now()}`,
      description,
      lat,
      lng,
      epoch: currentEpoch,
      year: worldState.year,
    };

    try {
      const epochConfig = EPOCHS[currentEpoch - 1];

      const response = await fetch('/api/intervene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intervention: description,
          lat,
          lng,
          currentState: worldState,
          previousInterventions: [...previousInterventions, intervention],
          startYear: epochConfig.startYear,
          endYear: epochConfig.endYear,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process intervention');
      }

      const result: InterventionResult = await response.json();

      // Update world state with the result
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
        previousInterventions: [...previousInterventions, intervention],
        interventionsRemaining: interventionsRemaining - 1,
        loading: false,
        zoomedIn: false,
        zoomLocation: null,
      });

      return result;
    } catch (error) {
      console.error('Error processing intervention:', error);
      set({ loading: false });
      return null;
    }
  },

  selectCity: (city: City | null) => {
    set({ selectedCity: city });
  },

  setZoomedIn: (zoomed: boolean, location?: { lat: number; lng: number }) => {
    set({
      zoomedIn: zoomed,
      zoomLocation: location || null,
    });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setAudioPlaying: (playing: boolean) => {
    set({ audioPlaying: playing });
  },

  setVoiceSessionActive: (active: boolean) => {
    set({ voiceSessionActive: active });
  },

  updateWorldState: (state: WorldState) => {
    set({ worldState: state });
  },

  nextEpoch: () => {
    const { currentEpoch } = get();
    if (currentEpoch < 4) {
      set({ currentEpoch: (currentEpoch + 1) as 1 | 2 | 3 | 4 });
    }
  },

  reset: () => {
    set(initialState);
  },
}));
