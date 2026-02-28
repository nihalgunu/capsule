'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { City, TradeRoute, Milestone, getCityColor, getAngularDistance } from '@/lib/types';
import { useGameStore } from '@/lib/store';

const GlobeGL = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-amber-500 text-xl">Loading Globe...</div>
    </div>
  ),
});

interface GlobeProps {
  selectedCity?: City | null;
  onCityClick?: (city: City) => void;
  rippleCenter?: { lat: number; lng: number } | null;
  rippleProgress?: number;
  milestones?: Milestone[];
  isLoading?: boolean;
}

export default function Globe({
  selectedCity,
  onCityClick,
  rippleCenter,
  rippleProgress = 1,
  milestones = [],
  isLoading = false,
}: GlobeProps) {
  const globeRef = useRef<any>(null);
  const { worldState, currentEpoch, chosenCity } = useGameStore();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-rotate — faster during loading, pause permanently on user interaction
  const userTouchedRef = useRef(false);
  const controlsReadyRef = useRef(false);

  useEffect(() => {
    if (!globeRef.current) return;

    const trySetup = () => {
      const controls = globeRef.current?.controls();
      if (!controls) return;

      controls.autoRotateSpeed = isLoading ? 1.2 : 0.3;

      if (userTouchedRef.current) {
        controls.autoRotate = false;
        return;
      }

      controls.autoRotate = true;

      if (!controlsReadyRef.current) {
        controlsReadyRef.current = true;
        controls.addEventListener('start', () => {
          userTouchedRef.current = true;
          controls.autoRotate = false;
        });
      }
    };

    // Controls may not be ready on first render, retry briefly
    trySetup();
    const t = setTimeout(trySetup, 500);
    return () => clearTimeout(t);
  }, [isLoading, dimensions]);

  // Fly to selected city (epoch 1 browsing)
  useEffect(() => {
    if (selectedCity && globeRef.current) {
      globeRef.current.pointOfView(
        { lat: selectedCity.lat, lng: selectedCity.lng, altitude: 2.0 },
        1000
      );
    }
  }, [selectedCity?.id]);

  // Auto-fly to chosen city on epoch transitions (epochs 2-4)
  useEffect(() => {
    if (chosenCity && currentEpoch >= 2 && currentEpoch <= 4 && globeRef.current) {
      globeRef.current.pointOfView(
        { lat: chosenCity.lat, lng: chosenCity.lng, altitude: 1.8 },
        1500
      );
    }
  }, [currentEpoch, chosenCity?.id]);

  // Ripple-based city visibility
  const getVisibleCities = useCallback(() => {
    if (!worldState?.cities) return [];
    if (!rippleCenter || rippleProgress >= 1) return worldState.cities;

    const rippleRadius = rippleProgress * 180;
    const bandWidth = 15;

    return worldState.cities.map((city) => {
      const distance = getAngularDistance(rippleCenter, { lat: city.lat, lng: city.lng });
      if (distance <= rippleRadius) {
        const distFromFront = rippleRadius - distance;
        if (distFromFront < bandWidth) {
          if (city.change === 'brighter' || city.change === 'new') {
            return { ...city, brightness: Math.min(city.brightness * 1.8, 1) };
          } else if (city.change === 'dimmer' || city.change === 'gone') {
            return { ...city, brightness: city.brightness * 0.4 };
          }
        }
        return city;
      }
      return { ...city, brightness: city.brightness * 0.3 };
    });
  }, [worldState?.cities, rippleCenter, rippleProgress]);

  const cityPoints = getVisibleCities();
  const arcsData = worldState?.tradeRoutes || [];

  const visibleMilestones = useMemo(() => {
    if (!rippleCenter || rippleProgress >= 1 || milestones.length === 0) return [];
    const rippleRadius = rippleProgress * 180;
    return milestones.filter((m) => {
      const dist = getAngularDistance(rippleCenter, { lat: m.lat, lng: m.lng });
      return dist <= rippleRadius;
    });
  }, [milestones, rippleCenter, rippleProgress]);

  const milestoneElements = useMemo(() => {
    return visibleMilestones.map((m, i) => ({
      lat: m.lat, lng: m.lng, label: m.event, year: m.year, id: `milestone-${i}`,
    }));
  }, [visibleMilestones]);

  // Point layer — BRIGHTER, LARGER cities
  const pointLat = (d: object) => (d as City).lat;
  const pointLng = (d: object) => (d as City).lng;
  const pointAltitude = (d: object) => Math.max((d as City).brightness, 0.4) * 0.03;
  const pointRadius = (d: object) => {
    const city = d as City;
    const isHighlighted = (chosenCity && currentEpoch >= 2 && city.id === chosenCity.id)
      || (selectedCity && city.id === selectedCity.id);
    return isHighlighted ? 1.5 : 0.7;
  };
  const pointColor = (d: object) => {
    const city = d as City;
    const isHighlighted = (chosenCity && currentEpoch >= 2 && city.id === chosenCity.id)
      || (selectedCity && city.id === selectedCity.id);
    return isHighlighted ? '#ffffff' : getCityColor(Math.max(city.techLevel, 3));
  };

  // Arc layer
  const arcStartLat = (d: object) => (d as TradeRoute).from.lat;
  const arcStartLng = (d: object) => (d as TradeRoute).from.lng;
  const arcEndLat = (d: object) => (d as TradeRoute).to.lat;
  const arcEndLng = (d: object) => (d as TradeRoute).to.lng;
  const arcColor = () => ['rgba(255, 170, 0, 0.6)', 'rgba(255, 102, 0, 0.6)'];
  const arcStroke = (d: object) => (d as TradeRoute).volume * 0.3;

  // City click — only epoch 1
  const handlePointClick = (point: object) => {
    if (currentEpoch !== 1) return;
    const city = point as City;
    if (onCityClick) onCityClick(city);
  };

  // Milestone HTML elements
  const htmlLat = (d: object) => (d as { lat: number }).lat;
  const htmlLng = (d: object) => (d as { lng: number }).lng;
  const htmlAltitude = () => 0.05;
  const htmlElement = (d: object) => {
    const m = d as { label: string; year: number };
    const el = document.createElement('div');
    el.style.cssText = `
      background: rgba(0,0,0,0.8);
      border: 1px solid rgba(245, 158, 11, 0.5);
      border-radius: 4px;
      padding: 3px 8px;
      color: #fbbf24;
      font-size: 10px;
      white-space: nowrap;
      pointer-events: none;
      transform: translate(-50%, -100%);
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    const yearStr = m.year < 0 ? `${Math.abs(m.year)} BC` : `${m.year} AD`;
    el.textContent = `${yearStr}: ${m.label}`;
    return el;
  };

  // Rings for highlighted city
  const highlightedCity = currentEpoch >= 2 ? chosenCity : selectedCity;
  const selectedRings = useMemo(() => {
    if (!highlightedCity) return [];
    return [{ lat: highlightedCity.lat, lng: highlightedCity.lng }];
  }, [highlightedCity?.id]);

  return (
    <div className="w-full h-full bg-black">
      <GlobeGL
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={cityPoints}
        pointLat={pointLat}
        pointLng={pointLng}
        pointAltitude={pointAltitude}
        pointRadius={pointRadius}
        pointColor={pointColor}
        pointLabel={(d: object) => {
          const city = d as City;
          if (city.causalNote) {
            return `<div style="background:rgba(0,0,0,0.85);border:1px solid rgba(245,158,11,0.5);border-radius:6px;padding:6px 10px;max-width:220px;font-size:12px;">
              <div style="color:#fbbf24;font-weight:600;margin-bottom:2px;">${city.name}</div>
              <div style="color:#d1d5db;font-style:italic;">${city.causalNote}</div>
            </div>`;
          }
          return `<div style="background:rgba(0,0,0,0.85);border:1px solid rgba(245,158,11,0.5);border-radius:6px;padding:4px 8px;font-size:12px;color:#fbbf24;font-weight:600;">${city.name}</div>`;
        }}
        onPointClick={handlePointClick}
        arcsData={arcsData}
        arcStartLat={arcStartLat}
        arcStartLng={arcStartLng}
        arcEndLat={arcEndLat}
        arcEndLng={arcEndLng}
        arcColor={arcColor}
        arcStroke={arcStroke}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        htmlElementsData={milestoneElements}
        htmlLat={htmlLat}
        htmlLng={htmlLng}
        htmlAltitude={htmlAltitude}
        htmlElement={htmlElement}
        ringsData={selectedRings}
        ringLat={(d: object) => (d as any).lat}
        ringLng={(d: object) => (d as any).lng}
        ringColor={() => (t: number) => `rgba(255, 200, 50, ${1 - t})`}
        ringMaxRadius={4}
        ringPropagationSpeed={2}
        ringRepeatPeriod={800}
        atmosphereColor="#4a3000"
        atmosphereAltitude={0.15}
      />
    </div>
  );
}
