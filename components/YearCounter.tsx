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

    // Starting animation — capture start year and time
    if (animStartRef.current === null) {
      animStartRef.current = Date.now();
      animStartYearRef.current = displayYear;
    }

    const startYear = animStartYearRef.current;
    const totalRange = targetYear - startYear;
    if (totalRange === 0) return;

    // Asymptotic animation: approaches ~90% over ~30s, never reaches target until API resolves
    const TAU = 25000; // time constant in ms

    const animate = () => {
      const elapsed = Date.now() - (animStartRef.current || Date.now());

      if (apiResolved) {
        // API resolved — quickly finish animation over 800ms
        const finishStart = Date.now();
        const currentDisplay = displayYear;
        const finishAnimate = () => {
          const finishElapsed = Date.now() - finishStart;
          const finishProgress = Math.min(finishElapsed / 800, 1);
          const eased = 1 - Math.pow(1 - finishProgress, 3);
          setDisplayYear(Math.round(currentDisplay + (targetYear - currentDisplay) * eased));
          if (finishProgress < 1) {
            frameRef.current = requestAnimationFrame(finishAnimate);
          }
        };
        frameRef.current = requestAnimationFrame(finishAnimate);
        return;
      }

      // Asymptotic approach — never quite reaches target
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

  // When apiResolved changes to true, trigger the finish animation
  useEffect(() => {
    if (apiResolved && isAnimating && targetYear) {
      const currentDisplay = displayYear;
      const startTime = Date.now();

      if (frameRef.current) cancelAnimationFrame(frameRef.current);

      const finishAnimate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / 800, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayYear(Math.round(currentDisplay + (targetYear - currentDisplay) * eased));
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(finishAnimate);
        }
      };
      frameRef.current = requestAnimationFrame(finishAnimate);
    }
  }, [apiResolved]);

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
