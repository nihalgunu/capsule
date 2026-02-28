'use client';

import { GameResult, GOAL_STATE } from '@/lib/types';

interface GoalScreenProps {
  result: GameResult | null;
  onPlayAgain: () => void;
}

export default function GoalScreen({ result, onPlayAgain }: GoalScreenProps) {
  const scoreColor = result
    ? result.score >= 70 ? 'text-green-400' : result.score >= 40 ? 'text-amber-400' : 'text-red-400'
    : 'text-gray-500';

  const scoreBorder = result
    ? result.score >= 70 ? 'border-green-500/30' : result.score >= 40 ? 'border-amber-500/30' : 'border-red-500/30'
    : 'border-gray-700/30';

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Background image if available */}
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

      <div className="relative z-10 text-center max-w-xl px-8">
        {/* Goal */}
        <p className="text-amber-400/60 text-sm uppercase tracking-widest mb-2">Goal</p>
        <h2 className="text-2xl font-bold text-amber-400 mb-8">{GOAL_STATE}</h2>

        {/* Score */}
        {result ? (
          <>
            <div className={`inline-block border ${scoreBorder} rounded-2xl px-12 py-8 mb-8 backdrop-blur-sm bg-black/40`}>
              <p className="text-gray-400 text-sm mb-2">Your Score</p>
              <p className={`text-7xl font-bold ${scoreColor}`}>{result.score}</p>
              <p className="text-gray-500 text-sm mt-1">/ 100</p>
            </div>

            {/* Analysis */}
            <p className="text-gray-200 text-sm leading-relaxed mb-6">{result.summary}</p>

            {/* Causal chain */}
            {result.causalChain.length > 0 && (
              <div className="text-left mb-8 space-y-2">
                {result.causalChain.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-amber-500/60 text-xs font-mono mt-0.5 shrink-0">
                      {i + 1}.
                    </span>
                    <span className="text-gray-400 text-sm">{step}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Loading state */
          <div className="mb-8">
            <div className="inline-block border border-gray-700/30 rounded-2xl px-12 py-8 backdrop-blur-sm bg-black/40">
              <p className="text-gray-400 text-sm mb-4">Analyzing your timeline...</p>
              <div className="flex justify-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-75" />
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-150" />
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
