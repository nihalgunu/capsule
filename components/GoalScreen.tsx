'use client';

import { City, GameResult, GOAL_STATE } from '@/lib/types';

interface GoalScreenProps {
  result: GameResult | null;
  chosenCity: City | null;
  onPlayAgain: () => void;
}

export default function GoalScreen({ result, chosenCity, onPlayAgain }: GoalScreenProps) {
  const hasScore = result && result.score > 0;

  const scoreColor = hasScore
    ? result.score >= 70 ? 'text-green-400' : result.score >= 40 ? 'text-amber-400' : 'text-red-400'
    : 'text-gray-500';

  const scoreBorder = hasScore
    ? result.score >= 70 ? 'border-green-500/30' : result.score >= 40 ? 'border-amber-500/30' : 'border-red-500/30'
    : 'border-gray-700/30';

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* AI-generated background image */}
      {result?.finalImageBase64 && (
        <>
          <img
            src={`data:image/png;base64,${result.finalImageBase64}`}
            alt="Earth at 4000 AD"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
        </>
      )}

      {/* Content — centered, compact, no scroll */}
      <div className="relative z-10 text-center max-w-lg px-6 flex flex-col items-center">
        {/* City journey header */}
        {chosenCity && (
          <>
            <p className="text-gray-400 text-sm mb-1">Your journey began in</p>
            <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">{chosenCity.name}</h1>
          </>
        )}

        {/* Score */}
        {hasScore ? (
          <>
            <div className={`border ${scoreBorder} rounded-2xl px-10 py-6 mb-4 backdrop-blur-sm bg-black/40`}>
              <p className="text-gray-400 text-xs mb-1">Your Score</p>
              <p className={`text-6xl font-bold ${scoreColor}`}>{result.score}</p>
              <p className="text-gray-500 text-xs mt-1">/ 100</p>
            </div>

            {/* Brief summary */}
            <p className="text-gray-200 text-sm leading-relaxed mb-6 max-w-md">{result.summary}</p>
          </>
        ) : (
          <div className="mb-6">
            <div className="border border-gray-700/30 rounded-2xl px-10 py-6 backdrop-blur-sm bg-black/40">
              <p className="text-gray-400 text-sm mb-3">Analyzing your timeline...</p>
              <div className="flex justify-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '75ms' }} />
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onPlayAgain}
          className="px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg text-black font-semibold transition-all"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
