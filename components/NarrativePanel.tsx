'use client';

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
  return (
    <div className="absolute top-20 left-6 max-w-sm z-10">
      {/* Goal reminder */}
      <div className="mb-2 px-3 py-1.5 bg-amber-900/30 border border-amber-700/30 rounded-lg">
        <p className="text-amber-400/80 text-xs">
          <span className="font-semibold">Goal:</span> {GOAL_STATE}
        </p>
      </div>

      {/* World TLDR — always visible, never collapsed */}
      <div className="bg-black/80 border border-amber-700/30 rounded-lg backdrop-blur-sm p-4">
        <p className="text-gray-200 text-sm leading-relaxed">{narrative}</p>
      </div>

      {/* Previous decisions */}
      {previousInterventions.length > 0 && (
        <div className="mt-2 space-y-1">
          {previousInterventions.map((intervention, i) => (
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
