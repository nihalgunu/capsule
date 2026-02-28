'use client';

import { useState, useEffect } from 'react';
import { RegionContext, WorldState } from '@/lib/types';

interface InterventionPanelProps {
  isVisible: boolean;
  isLoading: boolean;
  zoomLocation: { lat: number; lng: number } | null;
  worldState: WorldState | null;
  onSubmit: (description: string, lat: number, lng: number) => void;
  onClose: () => void;
}

export default function InterventionPanel({
  isVisible,
  isLoading,
  zoomLocation,
  worldState,
  onSubmit,
  onClose,
}: InterventionPanelProps) {
  const [customText, setCustomText] = useState('');
  const [context, setContext] = useState<RegionContext | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);

  // Fetch region context when zoomed in
  useEffect(() => {
    if (!isVisible || !zoomLocation) {
      setContext(null);
      return;
    }

    const fetchContext = async () => {
      setLoadingContext(true);
      try {
        const response = await fetch('/api/region-context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: zoomLocation.lat,
            lng: zoomLocation.lng,
            currentState: worldState,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setContext(data);
        }
      } catch (error) {
        console.error('Error fetching region context:', error);
      } finally {
        setLoadingContext(false);
      }
    };

    fetchContext();
  }, [isVisible, zoomLocation?.lat, zoomLocation?.lng]);

  const handleSuggestionClick = (suggestion: string) => {
    if (zoomLocation && !isLoading) {
      onSubmit(suggestion, zoomLocation.lat, zoomLocation.lng);
      setCustomText('');
    }
  };

  const handleCustomSubmit = () => {
    if (customText.trim() && zoomLocation && !isLoading) {
      onSubmit(customText.trim(), zoomLocation.lat, zoomLocation.lng);
      setCustomText('');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-4 px-6 animate-slide-up">
      <div className="max-w-4xl mx-auto">
        {/* Region description */}
        {loadingContext ? (
          <div className="mb-4 text-amber-500/60 animate-pulse">
            Analyzing region...
          </div>
        ) : context ? (
          <div className="mb-4">
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
              {context.description}
            </p>
          </div>
        ) : null}

        {/* Question prompt */}
        <h3 className="text-amber-400 text-lg font-medium mb-4">
          What changes here?
        </h3>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {context?.suggestions?.slice(0, 4).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion.text)}
              disabled={isLoading}
              className="px-4 py-2 bg-amber-900/30 hover:bg-amber-800/50 border border-amber-700/50
                       rounded-lg text-amber-200 text-sm transition-all disabled:opacity-50
                       disabled:cursor-not-allowed hover:border-amber-500/70"
              title={suggestion.reasoning}
            >
              {suggestion.text}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
            placeholder="Or describe your own change..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-black/60 border border-amber-700/40 rounded-lg
                     text-white placeholder-gray-500 focus:outline-none focus:border-amber-500
                     disabled:opacity-50"
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customText.trim() || isLoading}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg text-black font-medium
                     transition-all disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:hover:bg-amber-600"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Simulating...
              </span>
            ) : (
              'Change History'
            )}
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
