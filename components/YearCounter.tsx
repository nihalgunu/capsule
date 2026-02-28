'use client';

import { useEffect, useState } from 'react';
import { formatYear, EPOCHS } from '@/lib/types';

interface YearCounterProps {
  year: number;
  epoch: 1 | 2 | 3 | 4;
  interventionsRemaining: number;
  isAnimating?: boolean;
  targetYear?: number;
}

export default function YearCounter({
  year,
  epoch,
  interventionsRemaining,
  isAnimating = false,
  targetYear,
}: YearCounterProps) {
  const [displayYear, setDisplayYear] = useState(year);
  const epochConfig = EPOCHS[epoch - 1];

  // Animate year counter when transitioning
  useEffect(() => {
    if (!isAnimating || !targetYear || targetYear === year) {
      setDisplayYear(year);
      return;
    }

    const startYear = year;
    const endYear = targetYear;
    const duration = 4000; // 4 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentYear = Math.round(startYear + (endYear - startYear) * eased);

      setDisplayYear(currentYear);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isAnimating, targetYear, year]);

  return (
    <div className="flex items-center gap-6">
      {/* Epoch indicator */}
      <div className="flex flex-col items-end">
        <span className="text-amber-500/60 text-xs uppercase tracking-wider">
          Epoch {epoch}/4
        </span>
        <span className="text-amber-400 text-sm font-medium">
          {epochConfig.name}
        </span>
      </div>

      {/* Year display */}
      <div className="flex flex-col items-center min-w-[120px]">
        <span
          className={`text-3xl font-bold tracking-tight transition-all ${
            isAnimating ? 'text-amber-300 animate-pulse' : 'text-white'
          }`}
        >
          {formatYear(displayYear)}
        </span>
      </div>

      {/* Interventions remaining */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-2 h-6 rounded-full transition-all ${
              i <= interventionsRemaining
                ? 'bg-amber-500'
                : 'bg-amber-900/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
