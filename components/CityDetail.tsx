'use client';

import { useState, useCallback, useMemo } from 'react';
import { City, WorldState } from '@/lib/types';
import { useGameStore } from '@/lib/store';

interface CityDetailProps {
  city: City | null;
  worldState: WorldState | null;
  onClose: () => void;
  onCitySelect: (city: City) => void;
  onSubmitIntervention: (description: string) => void;
}

export default function CityDetail({ city, worldState, onClose, onCitySelect, onSubmitIntervention }: CityDetailProps) {
  const [inputText, setInputText] = useState('');
  const currentEpoch = useGameStore(s => s.currentEpoch);
  const loading = useGameStore(s => s.loading);
  const interventionsRemaining = useGameStore(s => s.interventionsRemaining);

  // All cities for epoch 1 navigation
  const allCities = useMemo(() => worldState?.cities || [], [worldState?.cities]);
  const currentIndex = useMemo(() => {
    if (!city) return -1;
    return allCities.findIndex(c => c.id === city.id);
  }, [city, allCities]);

  const goToCity = useCallback((direction: 1 | -1) => {
    if (allCities.length === 0) return;
    const nextIndex = (currentIndex + direction + allCities.length) % allCities.length;
    onCitySelect(allCities[nextIndex]);
  }, [currentIndex, allCities, onCitySelect]);

  const handleSubmit = useCallback(() => {
    if (inputText.trim() && !loading) {
      onSubmitIntervention(inputText.trim());
      setInputText('');
    }
  }, [inputText, onSubmitIntervention, loading]);

  if (!city) return null;

  // === EPOCH 1: Full-screen immersive view with pros/cons + next/prev arrows ===
  if (currentEpoch === 1) {
    return (
      <div className="fixed inset-0 z-40 bg-black">
        {/* Full-screen preset image */}
        <img
          src={`/cities/${city.id}.png`}
          alt={city.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

        {/* Back button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 z-50 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to globe
        </button>

        {/* City counter */}
        <div className="absolute top-6 right-6 z-50 text-white/50 text-sm">
          {currentIndex + 1} / {allCities.length}
        </div>

        {/* Previous arrow */}
        <button
          onClick={() => goToCity(-1)}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center
                   bg-black/40 hover:bg-black/70 border border-white/20 rounded-full text-white/70 hover:text-white transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next arrow */}
        <button
          onClick={() => goToCity(1)}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center
                   bg-black/40 hover:bg-black/70 border border-white/20 rounded-full text-white/70 hover:text-white transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* City info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-50">
          <div className="max-w-2xl">
            <p className="text-amber-400/80 text-sm uppercase tracking-wider mb-1">{city.civilization}</p>
            <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">{city.name}</h2>
            <p className="text-gray-200 text-lg mb-4 leading-relaxed max-w-xl">{city.description}</p>

            {/* Pros & Cons */}
            <div className="flex gap-4 mb-6 max-w-xl">
              {city.pros && (
                <div className="flex-1 pl-3 border-l-2 border-green-500/70">
                  <p className="text-green-400 text-xs uppercase tracking-wider mb-1 font-semibold">Advantages</p>
                  <p className="text-green-200/90 text-sm leading-relaxed">{city.pros}</p>
                </div>
              )}
              {city.cons && (
                <div className="flex-1 pl-3 border-l-2 border-red-500/70">
                  <p className="text-red-400 text-xs uppercase tracking-wider mb-1 font-semibold">Challenges</p>
                  <p className="text-red-200/90 text-sm leading-relaxed">{city.cons}</p>
                </div>
              )}
            </div>

            {/* Intervention input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="What will you change here? (This locks in your city)"
                disabled={loading}
                className="flex-1 px-5 py-4 bg-black/50 border border-amber-700/40 rounded-lg
                         text-white text-lg placeholder-gray-400 focus:outline-none focus:border-amber-500
                         disabled:opacity-50 backdrop-blur-sm"
              />
              <button
                onClick={handleSubmit}
                disabled={!inputText.trim() || loading}
                className="px-8 py-4 bg-amber-600 hover:bg-amber-500 rounded-lg text-black font-semibold text-lg
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Changing...' : 'Change History'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === EPOCHS 2-4: Side panel with embedded input ===
  const changeColor = city.change === 'brighter' || city.change === 'new'
    ? 'border-green-500/60'
    : city.change === 'dimmer' || city.change === 'gone'
    ? 'border-red-500/60'
    : 'border-amber-700/50';

  return (
    <div className={`absolute top-20 right-6 w-96 bg-black/90 border ${changeColor} rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm animate-slide-in z-20`}>
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-amber-400/70 text-xs uppercase tracking-wider">{city.civilization}</p>
            <h3 className="text-lg font-bold text-white">Your City: {city.name}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {city.change && city.change !== 'unchanged' && (
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            city.change === 'brighter' || city.change === 'new'
              ? 'bg-green-900/60 text-green-300'
              : 'bg-red-900/60 text-red-300'
          }`}>
            {city.change === 'brighter' && '↑ Flourishing'}
            {city.change === 'new' && '✦ Emerged'}
            {city.change === 'dimmer' && '↓ Declining'}
            {city.change === 'gone' && '✕ Collapsed'}
          </span>
        )}
      </div>

      <div className="px-4 pb-4 space-y-3">
        <p className="text-gray-300 text-sm leading-relaxed">{city.description}</p>

        {city.causalNote && (
          <div className="pl-3 border-l-2 border-amber-500/70">
            <p className="text-amber-400/90 text-sm italic">{city.causalNote}</p>
          </div>
        )}

        {/* Embedded intervention input — only if interventions remain */}
        {interventionsRemaining > 0 && (
          <div className="pt-3 border-t border-gray-800/50">
            <p className="text-amber-400/80 text-xs uppercase tracking-wider mb-2 font-semibold">
              What changes next?
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Describe your intervention..."
                disabled={loading}
                className="flex-1 px-3 py-2.5 bg-black/60 border border-amber-700/40 rounded-lg
                         text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500
                         disabled:opacity-50"
              />
              <button
                onClick={handleSubmit}
                disabled={!inputText.trim() || loading}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-black font-medium text-sm
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? 'Changing...' : 'Change'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
