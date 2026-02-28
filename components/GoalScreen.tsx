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
            className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/50" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 text-center max-w-md px-6 flex flex-col items-center gap-6">
        {/* City journey header */}
        {chosenCity && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-white/50 text-xs tracking-[0.2em] uppercase">Your journey began in</p>
            <h1 className="text-4xl font-light tracking-tight text-white">{chosenCity.name}</h1>
          </div>
        )}

        {/* Score */}
        {hasScore ? (
          <div className="flex flex-col items-center gap-5">
            <div className="relative flex flex-col items-center">
              <p className={`text-7xl font-extralight tracking-tight ${scoreColor}`}>{result.score}</p>
              <div className={`mt-1 h-px w-16 ${
                result.score >= 70 ? 'bg-green-400/40' : result.score >= 40 ? 'bg-amber-400/40' : 'bg-red-400/40'
              }`} />
              <p className="text-white/30 text-[11px] tracking-[0.15em] uppercase mt-2">out of 100</p>
            </div>

            {/* Summary */}
            <p className="text-white/70 text-[15px] leading-7 font-light max-w-sm">{result.summary}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-white/50 text-sm font-light tracking-wide">Analyzing your timeline</p>
            <div className="flex justify-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '75ms' }} />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            </div>
          </div>
        )}

        <button
          onClick={onPlayAgain}
          className="mt-2 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm font-medium tracking-wide transition-all duration-200"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
