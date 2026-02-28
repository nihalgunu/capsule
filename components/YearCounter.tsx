'use client';

import { useEffect, useState } from 'react';
import { formatYear, EPOCHS } from '@/lib/types';

interface YearCounterProps {
  year: number;
  epoch: 1 | 2 | 3 | 4 | 5;
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
  const epochConfig = EPOCHS[Math.min(epoch - 1, EPOCHS.length - 1)];

  useEffect(() => {
    if (!isAnimating || !targetYear || targetYear === year) {
      setDisplayYear(year);
      return;
    }

    const startYear = year;
    const endYear = targetYear;
    const duration = 4000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayYear(Math.round(startYear + (endYear - startYear) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isAnimating, targetYear, year]);

  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-end">
        <span className="text-amber-500/60 text-xs uppercase tracking-wider">
          Epoch {epoch}/5
        </span>
        <span className="text-amber-400 text-sm font-medium">
          {epochConfig.name}
        </span>
      </div>

      <div className="flex flex-col items-center min-w-[120px]">
        <span className={`text-3xl font-bold tracking-tight transition-all ${
          isAnimating ? 'text-amber-300 animate-pulse' : 'text-white'
        }`}>
          {formatYear(displayYear)}
        </span>
      </div>
    </div>
  );
}
