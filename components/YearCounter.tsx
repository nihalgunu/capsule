'use client';

import { useEffect, useState, useRef } from 'react';
import { formatYear, EPOCHS } from '@/lib/types';

interface YearCounterProps {
  year: number;
  epoch: 1 | 2 | 3 | 4 | 5;
  isAnimating?: boolean;
  targetYear?: number;
  apiResolved?: boolean;
}

export default function YearCounter({
  year,
  epoch,
  isAnimating = false,
  targetYear,
  apiResolved = false,
}: YearCounterProps) {
  const [displayYear, setDisplayYear] = useState(year);
  const animStartRef = useRef<number | null>(null);
  const animStartYearRef = useRef(year);
  const frameRef = useRef<number | null>(null);
  const epochConfig = EPOCHS[Math.min(epoch - 1, EPOCHS.length - 1)];

  useEffect(() => {
    // When not animating, snap to the actual year
    if (!isAnimating || !targetYear) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      animStartRef.current = null;
      setDisplayYear(year);
      return;
    }

    // If API already resolved, snap immediately to target
    if (apiResolved) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      setDisplayYear(targetYear);
      return;
    }

    // Starting animation — capture start year and time
    if (animStartRef.current === null) {
      animStartRef.current = Date.now();
      animStartYearRef.current = displayYear;
    }

    const startYear = animStartYearRef.current;
    const totalRange = targetYear - startYear;
    if (totalRange === 0) return;

    const TAU = 25000;

    const animate = () => {
      const elapsed = Date.now() - (animStartRef.current || Date.now());
      const progress = 1 - Math.exp(-elapsed / TAU);
      const newYear = Math.round(startYear + totalRange * progress * 0.92);
      setDisplayYear(newYear);
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isAnimating, targetYear, apiResolved]);

  // When apiResolved flips to true, immediately snap to target
  useEffect(() => {
    if (apiResolved && targetYear !== undefined) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      setDisplayYear(targetYear);
    }
  }, [apiResolved, targetYear]);

  // Snap to year when it changes externally (epoch transitions)
  useEffect(() => {
    if (!isAnimating) {
      setDisplayYear(year);
    }
  }, [year, isAnimating]);

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
          isAnimating ? 'text-amber-300' : 'text-white'
        }`}>
          {formatYear(displayYear)}
        </span>
      </div>
    </div>
  );
}
