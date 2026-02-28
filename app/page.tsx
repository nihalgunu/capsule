'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Globe from '@/components/Globe';
import YearCounter from '@/components/YearCounter';
import InterventionPanel from '@/components/InterventionPanel';
import CityDetail from '@/components/CityDetail';
import NarrativePanel from '@/components/NarrativePanel';
import GoalScreen from '@/components/GoalScreen';
import { useGameStore } from '@/lib/store';
import { City, InterventionResult, EPOCHS, getAngularDistance } from '@/lib/types';

export default function Home() {
  const {
    currentEpoch,
    interventionsRemaining,
    worldState,
    loading,
    selectedCity,
    zoomedIn,
    zoomLocation,
    previousInterventions,
    gameResult,
    initWorld,
    submitIntervention,
    selectCity,
    setZoomedIn,
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

  // Throttled zoom handler
  const lastZoomRef = useRef(0);
  const handleZoomChange = useCallback(
    (altitude: number, location: { lat: number; lng: number }) => {
      const now = Date.now();
      if (now - lastZoomRef.current < 300) return;
      lastZoomRef.current = now;
      if (isAnimating) return;

      // Only handle zoom for epochs 2-4 (epoch 1 uses full-screen city view)
      if (currentEpoch === 1 || currentEpoch === 5) return;

      const isNowZoomed = altitude < 1.5;
      if (isNowZoomed !== zoomedIn) {
        setZoomedIn(isNowZoomed, isNowZoomed ? location : undefined);
        if (isNowZoomed && worldState?.cities && !selectedCity) {
          let nearest: City | null = null;
          let nearestDist = Infinity;
          for (const city of worldState.cities) {
            const dist = getAngularDistance(location, { lat: city.lat, lng: city.lng });
            if (dist < 15 && dist < nearestDist) {
              nearest = city;
              nearestDist = dist;
            }
          }
          if (nearest) selectCity(nearest);
        }
      }
    },
    [zoomedIn, setZoomedIn, worldState?.cities, selectCity, selectedCity, isAnimating, currentEpoch]
  );

  // Handle city click
  const handleCityClick = useCallback((city: City) => {
    selectCity(city);
  }, [selectCity]);

  // Handle intervention (works for both epoch 1 full-screen and epochs 2-4 panel)
  const handleIntervention = useCallback(
    (description: string, lat: number, lng: number) => {
      const epochConfig = EPOCHS[currentEpoch - 1];

      // Start animation immediately
      setRippleCenter({ lat, lng });
      setRippleProgress(0);
      setIsAnimating(true);
      setTargetYear(epochConfig.endYear);

      // Close panels
      selectCity(null);
      setZoomedIn(false);

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
      submitIntervention(description, lat, lng).then((result) => {
        if (result) setLastResult(result);
      });
    },
    [currentEpoch, submitIntervention, selectCity, setZoomedIn]
  );

  // Handle reset
  const handleReset = useCallback(() => {
    reset();
    setLastResult(null);
    setIsInitialized(false);
  }, [reset]);

  // Show goal screen for epoch 5
  if (currentEpoch === 5) {
    return <GoalScreen result={gameResult} onPlayAgain={handleReset} />;
  }

  // Wait for world state
  if (!worldState) {
    return <div className="w-screen h-screen bg-black" />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Globe — full viewport */}
      <div className="absolute inset-0">
        <Globe
          selectedCity={selectedCity}
          onCityClick={handleCityClick}
          onZoomChange={handleZoomChange}
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

      {/* World TLDR + previous decisions — always visible */}
      {worldState.narrative && (
        <NarrativePanel
          narrative={worldState.narrative}
          previousInterventions={previousInterventions}
          currentEpoch={currentEpoch}
        />
      )}

      {/* City detail — full-screen (epoch 1) or side panel (epochs 2-4) */}
      <CityDetail
        city={selectedCity}
        worldState={worldState}
        onClose={() => selectCity(null)}
        onCitySelect={(city) => selectCity(city)}
        onSubmitIntervention={currentEpoch === 1 ? handleIntervention : undefined}
      />

      {/* Intervention panel — only epochs 2-4, only when zoomed in */}
      {currentEpoch >= 2 && currentEpoch <= 4 && (
        <InterventionPanel
          isVisible={zoomedIn && interventionsRemaining > 0}
          isLoading={loading}
          zoomLocation={zoomLocation}
          worldState={worldState}
          onSubmit={handleIntervention}
          onClose={() => setZoomedIn(false)}
        />
      )}

      {/* Instructions hint */}
      {!selectedCity && !zoomedIn && interventionsRemaining > 0 && !isAnimating && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-500 text-sm animate-pulse">
          {currentEpoch === 1
            ? 'Click a city to begin'
            : 'Scroll to zoom in on a region to make changes'
          }
        </div>
      )}
    </div>
  );
}
