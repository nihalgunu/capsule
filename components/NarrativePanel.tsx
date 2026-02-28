'use client';

import { useState, useEffect, useRef } from 'react';

interface NarrativePanelProps {
  narrative: string;
  narrationScript?: string;
  isPlaying: boolean;
  onPlayComplete?: () => void;
}

export default function NarrativePanel({
  narrative,
  narrationScript,
  isPlaying,
  onPlayComplete,
}: NarrativePanelProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-expand when narration script arrives
  useEffect(() => {
    if (narrationScript) {
      setIsExpanded(true);
    }
  }, [narrationScript]);

  // Generate TTS audio when narration script is provided
  useEffect(() => {
    if (!narrationScript || !isPlaying) return;

    const generateAudio = async () => {
      setLoadingAudio(true);
      try {
        const response = await fetch('/api/narrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ script: narrationScript }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.audioBase64) {
            const mime = data.mimeType || 'audio/wav';
            setAudioUrl(`data:${mime};base64,${data.audioBase64}`);
          }
        }
      } catch (error) {
        console.error('Error generating narration:', error);
      } finally {
        setLoadingAudio(false);
      }
    };

    generateAudio();
  }, [narrationScript, isPlaying]);

  // Play audio when URL is ready
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  }, [audioUrl]);

  const handleAudioEnd = () => {
    onPlayComplete?.();
  };

  return (
    <div className="absolute top-20 left-6 max-w-md">
      {/* Audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnd}
          className="hidden"
        />
      )}

      {/* Narrative card */}
      <div className="bg-black/80 border border-amber-700/40 rounded-lg backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-amber-900/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            {isPlaying ? (
              <div className="flex items-center gap-1">
                <span className="w-1 h-4 bg-amber-500 rounded-full animate-pulse" />
                <span className="w-1 h-6 bg-amber-500 rounded-full animate-pulse delay-75" />
                <span className="w-1 h-3 bg-amber-500 rounded-full animate-pulse delay-150" />
              </div>
            ) : (
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )}
            <span className="text-amber-400 font-medium">World Narrative</span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="px-4 pb-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              {narrative}
            </p>

            {/* Narration script text — always visible when available */}
            {narrationScript && (
              <div className="mt-3 pt-3 border-t border-amber-700/20">
                <div className="text-amber-500/60 text-xs uppercase tracking-wider mb-1">Narration</div>
                <p className="text-amber-200/80 text-sm leading-relaxed italic">
                  {narrationScript}
                </p>
              </div>
            )}

            {loadingAudio && (
              <div className="mt-3 flex items-center gap-2 text-amber-500/70 text-xs">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating narration audio...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
