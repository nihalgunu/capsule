'use client';

import { useState, useEffect, useMemo } from 'react';
import { City, WorldState, getCityColor, getAngularDistance } from '@/lib/types';

interface CityDetailProps {
  city: City | null;
  worldState: WorldState | null;
  onClose: () => void;
  onCitySelect: (city: City) => void;
}

export default function CityDetail({ city, worldState, onClose, onCitySelect }: CityDetailProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fetch generated image when city has imagePrompt
  useEffect(() => {
    if (!city?.imagePrompt) {
      setImageUrl(null);
      setLoadingImage(false);
      setImageError(false);
      return;
    }

    const generateImage = async () => {
      setLoadingImage(true);
      setImageError(false);

      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imagePrompt: city.imagePrompt }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.imageBase64) {
            setImageUrl(`data:image/png;base64,${data.imageBase64}`);
          }
        } else {
          setImageError(true);
        }
      } catch (error) {
        console.error('Error generating image:', error);
        setImageError(true);
      } finally {
        setLoadingImage(false);
      }
    };

    generateImage();
  }, [city?.id, city?.imagePrompt]);

  // Compute nearby cities
  const nearbyCities = useMemo(() => {
    if (!city || !worldState?.cities) return [];
    return worldState.cities
      .filter(c => c.id !== city.id)
      .map(c => ({
        city: c,
        distance: getAngularDistance({ lat: city.lat, lng: city.lng }, { lat: c.lat, lng: c.lng }),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }, [city, worldState?.cities]);

  if (!city) return null;

  const cityColor = getCityColor(city.techLevel);

  return (
    <div className="absolute top-20 right-6 w-96 bg-black/90 border border-amber-700/50 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Image section */}
      {city.imagePrompt && (
        <div className="relative h-48 bg-gradient-to-br from-amber-900/30 to-black">
          {loadingImage ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin h-8 w-8 text-amber-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-amber-500/70 text-sm">Generating illustration...</span>
              </div>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={`${city.name} in alternate timeline`}
              className="w-full h-full object-cover"
            />
          ) : imageError ? (
            <div className="absolute inset-0 flex items-center justify-center text-amber-700">
              <span className="text-sm">Image unavailable</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold" style={{ color: cityColor }}>
              {city.name}
            </h3>
            <p className="text-gray-400 text-sm">
              {city.civilization}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-3 text-sm">
          <div>
            <span className="text-gray-500">Population: </span>
            <span className="text-gray-200">{city.population.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500">Tech Level: </span>
            <span className="text-gray-200">{city.techLevel}/10</span>
          </div>
        </div>

        {/* Change indicator */}
        {city.change && city.change !== 'unchanged' && (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs mb-3 ${
            city.change === 'brighter' || city.change === 'new'
              ? 'bg-green-900/50 text-green-400'
              : city.change === 'dimmer' || city.change === 'gone'
              ? 'bg-red-900/50 text-red-400'
              : 'bg-gray-800 text-gray-400'
          }`}>
            {city.change === 'brighter' && '↑ Flourishing'}
            {city.change === 'new' && '✦ Emerged'}
            {city.change === 'dimmer' && '↓ Declining'}
            {city.change === 'gone' && '✕ Collapsed'}
          </div>
        )}

        {/* Causal note — above description with accent border */}
        {city.causalNote && (
          <div className="mb-3 pl-3 border-l-2 border-amber-500/70">
            <div className="text-amber-500 text-xs font-semibold uppercase tracking-wider mb-1">What Changed</div>
            <p className="text-amber-400/90 text-sm italic">
              {city.causalNote}
            </p>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          {city.description}
        </p>

        {/* Nearby cities */}
        {nearbyCities.length > 0 && (
          <div className="pt-3 border-t border-gray-800">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">Nearby</div>
            <div className="flex flex-wrap gap-2">
              {nearbyCities.map(({ city: nearby, distance }) => (
                <button
                  key={nearby.id}
                  onClick={() => onCitySelect(nearby)}
                  className="px-3 py-1.5 bg-gray-800/80 hover:bg-amber-900/40 border border-gray-700/50 hover:border-amber-700/50
                           rounded-full text-xs text-gray-300 hover:text-amber-300 transition-all flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getCityColor(nearby.techLevel) }} />
                  {nearby.name}
                  <span className="text-gray-600">{Math.round(distance)}°</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
