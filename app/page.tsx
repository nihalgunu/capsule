'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Globe from '@/components/Globe';
import YearCounter from '@/components/YearCounter';
import InterventionPanel from '@/components/InterventionPanel';
import CityDetail from '@/components/CityDetail';
import NarrativePanel from '@/components/NarrativePanel';
import { useGameStore } from '@/lib/store';
import { City, InterventionResult, EPOCHS } from '@/lib/types';

export default function Home() {
  const {
    currentEpoch,
    interventionsRemaining,
    worldState,
    loading,
    audioPlaying,
    selectedCity,
    zoomedIn,
    zoomLocation,
    initWorld,
    submitIntervention,
    selectCity,
    setZoomedIn,
    setAudioPlaying,
    nextEpoch,
    reset,
  } = useGameStore();

  const [isInitialized, setIsInitialized] = useState(false);
  const [rippleCenter, setRippleCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [rippleProgress, setRippleProgress] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetYear, setTargetYear] = useState<number | null>(null);
  const [currentNarration, setCurrentNarration] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  // Initialize the world on mount
  useEffect(() => {
    if (!isInitialized) {
      initWorld(true); // Use mock data for development
      setIsInitialized(true);
    }
  }, [initWorld, isInitialized]);

  // Hide intro after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Handle zoom changes from globe
  const handleZoomChange = useCallback(
    (altitude: number, location: { lat: number; lng: number }) => {
      const isZoomedIn = altitude < 1.5;
      if (isZoomedIn !== zoomedIn) {
        setZoomedIn(isZoomedIn, isZoomedIn ? location : undefined);
      }
    },
    [zoomedIn, setZoomedIn]
  );

  // Handle city click
  const handleCityClick = useCallback(
    (city: City) => {
      selectCity(city);
    },
    [selectCity]
  );

  // Handle intervention submission
  const handleIntervention = useCallback(
    async (description: string, lat: number, lng: number) => {
      // Start ripple animation
      setRippleCenter({ lat, lng });
      setRippleProgress(0);
      setIsAnimating(true);

      const epochConfig = EPOCHS[currentEpoch - 1];
      setTargetYear(epochConfig.endYear);

      // Submit the intervention
      const result = await submitIntervention(description, lat, lng);

      if (result) {
        // Set narration script if available
        if (result.narrationScript) {
          setCurrentNarration(result.narrationScript);
          setAudioPlaying(true);
        }

        // Animate the ripple
        const duration = 4000; // 4 seconds
        const startTime = Date.now();

        const animateRipple = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Ease out quad
          const eased = 1 - (1 - progress) * (1 - progress);
          setRippleProgress(eased);

          if (progress < 1) {
            requestAnimationFrame(animateRipple);
          } else {
            // Animation complete
            setIsAnimating(false);
            setRippleCenter(null);
            setTargetYear(null);
          }
        };

        requestAnimationFrame(animateRipple);
      } else {
        // Reset if intervention failed
        setRippleCenter(null);
        setRippleProgress(1);
        setIsAnimating(false);
        setTargetYear(null);
      }
    },
    [currentEpoch, submitIntervention, setAudioPlaying]
  );

  // Handle narration complete
  const handleNarrationComplete = useCallback(() => {
    setAudioPlaying(false);
    setCurrentNarration(null);
  }, [setAudioPlaying]);

  // Handle closing intervention panel
  const handleCloseIntervention = useCallback(() => {
    setZoomedIn(false);
  }, [setZoomedIn]);

  // Handle next epoch
  const handleNextEpoch = useCallback(() => {
    nextEpoch();
    initWorld(true); // Reinitialize for new epoch
  }, [nextEpoch, initWorld]);

  // Handle reset
  const handleReset = useCallback(() => {
    reset();
    initWorld(true);
  }, [reset, initWorld]);

  // Loading state
  if (!worldState) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="text-amber-500 text-2xl font-bold">CHRONICLE</div>
          <div className="text-amber-500/60 text-sm animate-pulse">Loading world...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Globe - full viewport */}
      <div className="absolute inset-0">
        <Globe
          onCityClick={handleCityClick}
          onZoomChange={handleZoomChange}
          rippleCenter={rippleCenter}
          rippleProgress={rippleProgress}
        />
      </div>

      {/* Intro overlay */}
      {showIntro && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-1000">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-amber-500 mb-4">CHRONICLE</h1>
            <p className="text-gray-400 max-w-md">
              Zoom into any point on Earth, change one thing, and watch the consequences ripple across the globe.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-amber-500 tracking-wider">CHRONICLE</h1>
          </div>

          {/* Year counter */}
          <YearCounter
            year={worldState.year}
            epoch={currentEpoch}
            interventionsRemaining={interventionsRemaining}
            isAnimating={isAnimating}
            targetYear={targetYear ?? undefined}
          />

          {/* Actions */}
          <div className="flex items-center gap-3">
            {interventionsRemaining === 0 && currentEpoch < 4 && (
              <button
                onClick={handleNextEpoch}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-black font-medium transition-all"
              >
                Next Epoch
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-3 py-2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Narrative panel */}
      {worldState.narrative && (
        <NarrativePanel
          narrative={worldState.narrative}
          narrationScript={currentNarration ?? undefined}
          isPlaying={audioPlaying}
          onPlayComplete={handleNarrationComplete}
        />
      )}

      {/* City detail panel */}
      <CityDetail city={selectedCity} onClose={() => selectCity(null)} />

      {/* Intervention panel */}
      <InterventionPanel
        isVisible={zoomedIn && interventionsRemaining > 0}
        isLoading={loading}
        zoomLocation={zoomLocation}
        worldState={worldState}
        onSubmit={handleIntervention}
        onClose={handleCloseIntervention}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-12 w-12 text-amber-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-amber-500 text-lg font-medium">Simulating consequences...</span>
          </div>
        </div>
      )}

      {/* Instructions hint */}
      {!zoomedIn && interventionsRemaining > 0 && !showIntro && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-500 text-sm animate-pulse">
          Scroll to zoom in on a region to make changes
        </div>
      )}

      {/* Game complete overlay */}
      {interventionsRemaining === 0 && currentEpoch === 4 && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="text-center max-w-lg p-8">
            <h2 className="text-3xl font-bold text-amber-500 mb-4">Timeline Complete</h2>
            <p className="text-gray-300 mb-6">
              You have shaped 14,000 years of human history. The world you see is the result of your four interventions.
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg text-black font-medium transition-all"
            >
              Start New Timeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
