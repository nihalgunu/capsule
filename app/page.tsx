'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Globe from '@/components/Globe';
import YearCounter from '@/components/YearCounter';
import CityDetail from '@/components/CityDetail';
import NarrativePanel from '@/components/NarrativePanel';
import GoalScreen from '@/components/GoalScreen';
import { useGameStore } from '@/lib/store';
import { City, InterventionResult, EPOCHS } from '@/lib/types';

export default function Home() {
  const {
    currentEpoch,
    interventionsRemaining,
    worldState,
    loading,
    selectedCity,
    chosenCity,
    previousInterventions,
    gameResult,
    initWorld,
    submitIntervention,
    selectCity,
    setChosenCity,
    reset,
  } = useGameStore();

  const [isInitialized, setIsInitialized] = useState(false);
  const [rippleCenter, setRippleCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [rippleProgress, setRippleProgress] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetYear, setTargetYear] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<InterventionResult | null>(null);

  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      initWorld(1);
      setIsInitialized(true);
    }
  }, [initWorld, isInitialized]);

  // Auto-select chosen city panel for epochs 2-4
  useEffect(() => {
    if (chosenCity && currentEpoch >= 2 && currentEpoch <= 4 && interventionsRemaining > 0 && !isAnimating) {
      // Find the chosen city in current world state (might have updated stats)
      const updatedCity = worldState?.cities.find(c => c.id === chosenCity.id) || chosenCity;
      selectCity(updatedCity);
    }
  }, [currentEpoch, chosenCity, interventionsRemaining, isAnimating]);

  // Handle city click (epoch 1 only)
  const handleCityClick = useCallback((city: City) => {
    if (currentEpoch === 1) {
      selectCity(city);
    }
  }, [selectCity, currentEpoch]);

  // Handle intervention — works for all epochs
  const handleIntervention = useCallback(
    (description: string) => {
      if (!chosenCity && !selectedCity) return;

      const city = chosenCity || selectedCity!;
      const epochConfig = EPOCHS[currentEpoch - 1];

      // Epoch 1: lock in the city
      if (currentEpoch === 1 && !chosenCity && selectedCity) {
        setChosenCity(selectedCity);
      }

      // Start ripple animation
      setRippleCenter({ lat: city.lat, lng: city.lng });
      setRippleProgress(0);
      setIsAnimating(true);
      setTargetYear(epochConfig.endYear);

      // Close panel
      selectCity(null);

      // Ripple animation
      const duration = 5000;
      const startTime = Date.now();
      const animateRipple = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setRippleProgress(1 - (1 - progress) * (1 - progress));
        if (progress < 1) {
          requestAnimationFrame(animateRipple);
        } else {
          setIsAnimating(false);
          setRippleCenter(null);
          setTargetYear(null);
        }
      };
      requestAnimationFrame(animateRipple);

      // Fire API
      submitIntervention(description).then((result) => {
        if (result) setLastResult(result);
      });
    },
    [currentEpoch, submitIntervention, selectCity, chosenCity, selectedCity, setChosenCity]
  );

  // Handle reset
  const handleReset = useCallback(() => {
    reset();
    setLastResult(null);
    setIsInitialized(false);
  }, [reset]);

  // Show goal screen for epoch 5
  if (currentEpoch === 5) {
    return <GoalScreen result={gameResult} chosenCity={chosenCity} onPlayAgain={handleReset} />;
  }

  // Wait for world state
  if (!worldState) {
    return <div className="w-screen h-screen bg-black" />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Globe */}
      <div className="absolute inset-0">
        <Globe
          selectedCity={selectedCity}
          onCityClick={handleCityClick}
          rippleCenter={rippleCenter}
          rippleProgress={rippleProgress}
          milestones={lastResult?.milestones}
        />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-amber-500 tracking-wider">CHRONICLE</h1>

          <YearCounter
            year={worldState.year}
            epoch={currentEpoch}
            interventionsRemaining={interventionsRemaining}
            isAnimating={isAnimating}
            targetYear={targetYear ?? undefined}
          />

          <button
            onClick={handleReset}
            className="px-3 py-2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
          >
            Reset
          </button>
        </div>
      </header>

      {/* World TLDR + previous decisions */}
      {worldState.narrative && (
        <NarrativePanel
          narrative={worldState.narrative}
          previousInterventions={previousInterventions}
          currentEpoch={currentEpoch}
        />
      )}

      {/* City detail — full-screen (epoch 1) or side panel with embedded input (epochs 2-4) */}
      <CityDetail
        city={selectedCity}
        worldState={worldState}
        onClose={() => selectCity(null)}
        onSubmitIntervention={handleIntervention}
      />

      {/* Instructions hint */}
      {!selectedCity && interventionsRemaining > 0 && !isAnimating && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-500 text-sm animate-pulse">
          {currentEpoch === 1
            ? 'Click a city to begin your journey'
            : `Your city: ${chosenCity?.name || '...'} — opening panel...`
          }
        </div>
      )}
    </div>
  );
}
