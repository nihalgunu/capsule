'use client';

import { useState, useCallback, useMemo } from 'react';
import { City, WorldState, getCityColor, getAngularDistance } from '@/lib/types';
import { useGameStore } from '@/lib/store';

interface CityDetailProps {
  city: City | null;
  worldState: WorldState | null;
  onClose: () => void;
  onCitySelect: (city: City) => void;
  onSubmitIntervention?: (description: string, lat: number, lng: number) => void;
}

export default function CityDetail({ city, worldState, onClose, onCitySelect, onSubmitIntervention }: CityDetailProps) {
  const [inputText, setInputText] = useState('');
  const currentEpoch = useGameStore(s => s.currentEpoch);
  const loading = useGameStore(s => s.loading);

  const nearbyCities = useMemo(() => {
    if (!city || !worldState?.cities) return [];
    return worldState.cities
      .filter(c => c.id !== city.id)
      .map(c => ({ city: c, distance: getAngularDistance({ lat: city.lat, lng: city.lng }, { lat: c.lat, lng: c.lng }) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }, [city, worldState?.cities]);

  const handleSubmit = useCallback(() => {
    if (inputText.trim() && city && onSubmitIntervention && !loading) {
      onSubmitIntervention(inputText.trim(), city.lat, city.lng);
      setInputText('');
    }
  }, [inputText, city, onSubmitIntervention, loading]);

  if (!city) return null;

  // === EPOCH 1: Full-screen immersive view with preset image ===
  if (currentEpoch === 1) {
    return (
      <div className="fixed inset-0 z-40 bg-black">
        {/* Full-screen preset image */}
        <img
          src={`/cities/${city.id}.png`}
          alt={city.name}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

        {/* Close / back button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 z-50 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to globe
        </button>

        {/* City info overlaid at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-50">
          <div className="max-w-2xl">
            <p className="text-amber-400/80 text-sm uppercase tracking-wider mb-1">{city.civilization}</p>
            <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">{city.name}</h2>
            <p className="text-gray-200 text-lg mb-6 leading-relaxed max-w-xl">{city.description}</p>

            {/* Intervention input — embedded in the immersive view */}
            <div className="flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="What will you change here?"
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

  // === EPOCHS 2-4: Right-side text panel (no image) ===
  const changeColor = city.change === 'brighter' || city.change === 'new'
    ? 'border-green-500/60'
    : city.change === 'dimmer' || city.change === 'gone'
    ? 'border-red-500/60'
    : 'border-amber-700/50';

  return (
    <div className={`absolute top-20 right-6 w-80 bg-black/90 border ${changeColor} rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm animate-slide-in z-20`}>
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-amber-400/70 text-xs uppercase tracking-wider">{city.civilization}</p>
            <h3 className="text-lg font-bold text-white">{city.name}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Change badge */}
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
        {/* TLDR description */}
        <p className="text-gray-300 text-sm leading-relaxed">{city.description}</p>

        {/* Causal note — references previous decision */}
        {city.causalNote && (
          <div className="pl-3 border-l-2 border-amber-500/70">
            <p className="text-amber-400/90 text-sm italic">{city.causalNote}</p>
          </div>
        )}

        {/* Tech level dots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i < city.techLevel ? '' : 'opacity-20'}`}
              style={{ backgroundColor: i < city.techLevel ? getCityColor(city.techLevel) : '#333' }}
            />
          ))}
        </div>

        {/* Nearby cities */}
        {nearbyCities.length > 0 && (
          <div className="pt-2 border-t border-gray-800/50 flex flex-wrap gap-1.5">
            {nearbyCities.map(({ city: nearby }) => (
              <button
                key={nearby.id}
                onClick={() => onCitySelect(nearby)}
                className="px-2.5 py-1 bg-gray-800/80 hover:bg-amber-900/40 border border-gray-700/50
                         rounded-full text-xs text-gray-300 hover:text-amber-300 transition-all flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCityColor(nearby.techLevel) }} />
                {nearby.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
