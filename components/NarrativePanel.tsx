'use client';

import { useEffect, useState, useRef } from 'react';
import { Intervention, formatYear, GOAL_STATE } from '@/lib/types';

interface NarrativePanelProps {
  narrative: string;
  previousInterventions: Intervention[];
  currentEpoch: number;
}

export default function NarrativePanel({
  narrative,
  previousInterventions,
  currentEpoch,
}: NarrativePanelProps) {
  const [muted, setMuted] = useState(false);
  const lastNarrativeRef = useRef('');
  const hasSpokenRef = useRef(false);

  // TTS: speak new narrative on epoch transitions
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (muted) return;
    if (!narrative || narrative === lastNarrativeRef.current) return;

    // Don't speak the initial load narrative or optimistic "ripples through history" text
    if (narrative.includes('ripples through history')) return;

    lastNarrativeRef.current = narrative;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(narrative);
    utterance.rate = 1.1;
    utterance.pitch = 0.9;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }, [narrative, muted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="absolute top-20 left-6 max-w-sm z-10">
      {/* Goal reminder */}
      <div className="mb-2 px-3 py-1.5 bg-amber-900/30 border border-amber-700/30 rounded-lg">
        <p className="text-amber-400/80 text-xs">
          <span className="font-semibold">Goal:</span> {GOAL_STATE}
        </p>
      </div>

      {/* World TLDR */}
      <div className="bg-black/80 border border-amber-700/30 rounded-lg backdrop-blur-sm p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-gray-200 text-sm leading-relaxed flex-1">{narrative}</p>

          {/* Mute toggle */}
          <button
            onClick={() => {
              setMuted(m => !m);
              if (!muted && typeof window !== 'undefined') {
                window.speechSynthesis.cancel();
              }
            }}
            className="shrink-0 p-1.5 text-gray-500 hover:text-amber-400 transition-colors"
            title={muted ? 'Unmute narration' : 'Mute narration'}
          >
            {muted ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Previous decisions */}
      {previousInterventions.length > 0 && (
        <div className="mt-2 space-y-1">
          {previousInterventions.map((intervention) => (
            <div
              key={intervention.id}
              className="flex items-start gap-2 px-3 py-1.5 bg-black/60 border border-gray-800/50 rounded-lg"
            >
              <span className="text-amber-500/70 text-xs font-mono mt-0.5">
                {formatYear(intervention.year)}
              </span>
              <span className="text-gray-400 text-xs leading-snug line-clamp-1">
                {intervention.description}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
