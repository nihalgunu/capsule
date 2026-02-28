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
    earlyImageBase64,
    initWorld,
    submitIntervention,
    selectCity,
    setChosenCity,
    advanceToResults,
    reset,
  } = useGameStore();

  const [isInitialized, setIsInitialized] = useState(false);
  const [rippleCenter, setRippleCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [rippleProgress, setRippleProgress] = useState(1);
  const [lastResult, setLastResult] = useState<InterventionResult | null>(null);

  // Year counter animation state (tied to API response time)
  const [yearAnimating, setYearAnimating] = useState(false);
  const [targetYear, setTargetYear] = useState<number | undefined>(undefined);
  const [apiResolved, setApiResolved] = useState(false);

  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      initWorld(1);
      setIsInitialized(true);
    }
  }, [initWorld, isInitialized]);

  // Auto-select chosen city panel for epochs 2-4
  useEffect(() => {
    if (chosenCity && currentEpoch >= 2 && currentEpoch <= 4 && interventionsRemaining > 0 && !yearAnimating) {
      const updatedCity = worldState?.cities.find(c => c.id === chosenCity.id) || chosenCity;
      selectCity(updatedCity);
    }
  }, [currentEpoch, chosenCity, interventionsRemaining, yearAnimating]);

  // Handle city click (epoch 1 only)
  const handleCityClick = useCallback((city: City) => {
    if (currentEpoch === 1) {
      selectCity(city);
    }
  }, [selectCity, currentEpoch]);

  // Handle intervention
  const handleIntervention = useCallback(
    (description: string) => {
      if (!chosenCity && !selectedCity) return;

      const city = chosenCity || selectedCity!;
      const epochConfig = EPOCHS[currentEpoch - 1];

      // Epoch 1: lock in the city
      if (currentEpoch === 1 && !chosenCity && selectedCity) {
        setChosenCity(selectedCity);
      }

      // Start ripple animation (visual only, fixed 5s)
      setRippleCenter({ lat: city.lat, lng: city.lng });
      setRippleProgress(0);

      const rippleDuration = 5000;
      const rippleStart = Date.now();
      const animateRipple = () => {
        const elapsed = Date.now() - rippleStart;
        const progress = Math.min(elapsed / rippleDuration, 1);
        setRippleProgress(1 - (1 - progress) * (1 - progress));
        if (progress < 1) {
          requestAnimationFrame(animateRipple);
        } else {
          setRippleCenter(null);
        }
      };
      requestAnimationFrame(animateRipple);

      // Start year counter animation (matches API response time)
      setYearAnimating(true);
      setTargetYear(epochConfig.endYear);
      setApiResolved(false);

      // Close panel
      selectCity(null);

      // Fire API — year counter stops when this resolves
      submitIntervention(description).then((result) => {
        if (result) setLastResult(result);

        // Signal year counter to finish
        setApiResolved(true);

        // After year counter finishes its snap animation, stop
        setTimeout(() => {
          setYearAnimating(false);
          setTargetYear(undefined);
        }, 1000);
      });
    },
    [currentEpoch, submitIntervention, selectCity, chosenCity, selectedCity, setChosenCity]
  );

  // Handle reset
  const handleReset = useCallback(() => {
    reset();
    setLastResult(null);
    setIsInitialized(false);
    setYearAnimating(false);
    setTargetYear(undefined);
    setApiResolved(false);
  }, [reset]);

  // Show goal screen for epoch 5
  if (currentEpoch === 5) {
    return <GoalScreen result={gameResult} chosenCity={chosenCity} onPlayAgain={handleReset} />;
  }

  // Wait for world state
  if (!worldState) {
    return <div className="w-screen h-screen bg-black" />;
  }

  // Epoch 4 results: user has submitted but hasn't gone to final screen yet
  const showResultsButton = currentEpoch === 4 && interventionsRemaining === 0 && !loading && !yearAnimating;

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
          isLoading={loading}
        />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-amber-500 tracking-wider">CHRONICLE</h1>

          <YearCounter
            year={worldState.year}
            epoch={currentEpoch}
            isAnimating={yearAnimating}
            targetYear={targetYear}
            apiResolved={apiResolved}
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

      {/* City detail */}
      <CityDetail
        city={selectedCity}
        worldState={worldState}
        onClose={() => selectCity(null)}
        onCitySelect={(city) => selectCity(city)}
        onSubmitIntervention={handleIntervention}
      />

      {/* "See Your Results" button — epoch 4 after submission, gated on image ready */}
      {showResultsButton && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
          {earlyImageBase64 ? (
            <button
              onClick={advanceToResults}
              className="px-10 py-4 bg-amber-600 hover:bg-amber-500 rounded-xl text-black font-bold text-lg
                       transition-all shadow-lg shadow-amber-900/50 animate-pulse hover:animate-none"
            >
              See Your Results
            </button>
          ) : (
            <div className="flex items-center gap-3 px-8 py-4 bg-black/70 border border-amber-700/40 rounded-xl backdrop-blur-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '75ms' }} />
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              </div>
              <span className="text-amber-400/80 text-sm">Preparing your results...</span>
            </div>
          )}
        </div>
      )}

      {/* Instructions hint */}
      {!selectedCity && interventionsRemaining > 0 && !yearAnimating && (
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
