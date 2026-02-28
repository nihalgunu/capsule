'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { City, TradeRoute, Milestone, getCityColor, getAngularDistance } from '@/lib/types';
import { useGameStore } from '@/lib/store';

// Dynamically import react-globe.gl to avoid SSR issues
const GlobeGL = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-amber-500 text-xl">Loading Globe...</div>
    </div>
  ),
});

interface GlobeProps {
  onCityClick?: (city: City) => void;
  onZoomChange?: (altitude: number, location: { lat: number; lng: number }) => void;
  rippleCenter?: { lat: number; lng: number } | null;
  rippleProgress?: number; // 0 to 1
  milestones?: Milestone[];
}

export default function Globe({
  onCityClick,
  onZoomChange,
  rippleCenter,
  rippleProgress = 1,
  milestones = [],
}: GlobeProps) {
  const globeRef = useRef<any>(null);
  const { worldState, previousInterventions } = useGameStore();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-rotate the globe slowly
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
      }
    }
  }, []);

  // Handle POV changes (zoom detection)
  const handlePovChange = useCallback(
    (pov: { lat: number; lng: number; altitude: number }) => {
      if (onZoomChange) {
        onZoomChange(pov.altitude, { lat: pov.lat, lng: pov.lng });
      }
    },
    [onZoomChange]
  );

  // Filter cities based on ripple progress with wave-band effect
  const getVisibleCities = useCallback(() => {
    if (!worldState?.cities) return [];

    // If no ripple animation, show all cities
    if (!rippleCenter || rippleProgress >= 1) {
      return worldState.cities;
    }

    // Ripple radius in degrees (180 = full globe)
    const rippleRadius = rippleProgress * 180;
    const bandWidth = 15; // degrees width of the wave-band

    return worldState.cities.map((city) => {
      const distance = getAngularDistance(rippleCenter, { lat: city.lat, lng: city.lng });

      if (distance <= rippleRadius) {
        // City is behind the ripple front — apply wave-band scaling
        const distFromFront = rippleRadius - distance;
        if (distFromFront < bandWidth) {
          // In the wave-band: scale cities based on change
          const change = city.change;
          if (change === 'brighter' || change === 'new') {
            return { ...city, brightness: Math.min(city.brightness * 1.8, 1) };
          } else if (change === 'dimmer' || change === 'gone') {
            return { ...city, brightness: city.brightness * 0.4 };
          }
        }
        return city; // Show new state normally
      }

      // Outside ripple — show dimmed
      return {
        ...city,
        brightness: city.brightness * 0.3,
      };
    });
  }, [worldState?.cities, rippleCenter, rippleProgress]);

  // Get city point data
  const cityPoints = getVisibleCities();

  // Get arc data for trade routes
  const arcsData = worldState?.tradeRoutes || [];

  // Milestones visible based on ripple progress
  const visibleMilestones = useMemo(() => {
    if (!rippleCenter || rippleProgress >= 1 || milestones.length === 0) return [];

    const rippleRadius = rippleProgress * 180;
    return milestones.filter((m) => {
      const dist = getAngularDistance(rippleCenter, { lat: m.lat, lng: m.lng });
      return dist <= rippleRadius;
    });
  }, [milestones, rippleCenter, rippleProgress]);

  // HTML elements for milestone labels
  const milestoneElements = useMemo(() => {
    return visibleMilestones.map((m, i) => ({
      lat: m.lat,
      lng: m.lng,
      label: m.event,
      year: m.year,
      id: `milestone-${i}`,
    }));
  }, [visibleMilestones]);

  // Point layer callbacks (cast to object for react-globe.gl typing)
  const pointLat = (d: object) => (d as City).lat;
  const pointLng = (d: object) => (d as City).lng;
  const pointAltitude = (d: object) => (d as City).brightness * 0.02;
  const pointRadius = (d: object) => Math.sqrt((d as City).population) * 0.002 + 0.3;
  const pointColor = (d: object) => getCityColor((d as City).techLevel);
  const pointLabel = (d: object) => {
    const city = d as City;
    return `
    <div style="
      background: rgba(0,0,0,0.85);
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid ${getCityColor(city.techLevel)};
      max-width: 250px;
    ">
      <div style="color: ${getCityColor(city.techLevel)}; font-weight: bold; margin-bottom: 4px;">
        ${city.name}
      </div>
      <div style="color: #aaa; font-size: 12px; margin-bottom: 4px;">
        ${city.civilization} • Pop: ${city.population.toLocaleString()}
      </div>
      <div style="color: #ddd; font-size: 11px;">
        ${city.description}
      </div>
      ${city.causalNote ? `
        <div style="color: #f0c040; font-size: 11px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #333;">
          ${city.causalNote}
        </div>
      ` : ''}
    </div>
  `;
  };

  // Arc layer callbacks (cast to object for react-globe.gl typing)
  const arcStartLat = (d: object) => (d as TradeRoute).from.lat;
  const arcStartLng = (d: object) => (d as TradeRoute).from.lng;
  const arcEndLat = (d: object) => (d as TradeRoute).to.lat;
  const arcEndLng = (d: object) => (d as TradeRoute).to.lng;
  const arcColor = () => ['rgba(255, 170, 0, 0.6)', 'rgba(255, 102, 0, 0.6)'];
  const arcStroke = (d: object) => (d as TradeRoute).volume * 0.3;
  const arcLabel = (d: object) => {
    const route = d as TradeRoute;
    return `
    <div style="
      background: rgba(0,0,0,0.85);
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid #ff6600;
      max-width: 200px;
    ">
      <div style="color: #ff9900; font-weight: bold; font-size: 12px;">
        ${route.from.city} → ${route.to.city}
      </div>
      <div style="color: #ddd; font-size: 11px; margin-top: 4px;">
        ${route.description}
      </div>
    </div>
  `;
  };

  // Handle city click
  const handlePointClick = (point: object) => {
    const city = point as City;
    if (onCityClick) {
      onCityClick(city);
    }
  };

  // HTML elements layer callbacks for milestones
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

  return (
    <div className="w-full h-full bg-black">
      <GlobeGL
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        // Points (cities)
        pointsData={cityPoints}
        pointLat={pointLat}
        pointLng={pointLng}
        pointAltitude={pointAltitude}
        pointRadius={pointRadius}
        pointColor={pointColor}
        pointLabel={pointLabel}
        onPointClick={handlePointClick}
        // Arcs (trade routes)
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
        arcLabel={arcLabel}
        // HTML elements (milestone labels)
        htmlElementsData={milestoneElements}
        htmlLat={htmlLat}
        htmlLng={htmlLng}
        htmlAltitude={htmlAltitude}
        htmlElement={htmlElement}
        // Camera settings
        onZoom={handlePovChange}
        // Atmosphere
        atmosphereColor="#4a3000"
        atmosphereAltitude={0.15}
      />
    </div>
  );
}
