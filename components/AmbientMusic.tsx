'use client';

import { useEffect, useRef, useCallback } from 'react';

interface AmbientMusicProps {
  isNarrating?: boolean;
  muted?: boolean;
}

// Procedural ambient space music using Web Audio API
export default function AmbientMusic({ isNarrating = false, muted = false }: AmbientMusicProps) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const startedRef = useRef(false);
  const nodesRef = useRef<OscillatorNode[]>([]);

  const BASE_VOLUME = 0.07; // Very dim
  const DUCK_VOLUME = 0.015; // Even quieter during narration

  const startAmbient = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = BASE_VOLUME;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    // Layer 1: Deep sub drone (C1)
    const createDrone = (freq: number, type: OscillatorType, gainVal: number, detuneRange: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = gainVal;

      // Slow detune LFO for organic movement
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.03 + Math.random() * 0.04; // Very slow
      lfoGain.gain.value = detuneRange;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      lfo.start();

      // Volume breathing LFO
      const volLfo = ctx.createOscillator();
      const volLfoGain = ctx.createGain();
      volLfo.type = 'sine';
      volLfo.frequency.value = 0.015 + Math.random() * 0.02;
      volLfoGain.gain.value = gainVal * 0.3;
      volLfo.connect(volLfoGain);
      volLfoGain.connect(gain.gain);
      volLfo.start();

      osc.connect(gain);
      gain.connect(master);
      osc.start();
      nodesRef.current.push(osc, lfo, volLfo);
    };

    // Deep foundation — C1 + G1
    createDrone(32.7, 'sine', 0.8, 3);     // C1 sub bass
    createDrone(49.0, 'sine', 0.5, 4);     // G1 fifth

    // Mid pad layer — C3 + E3 + G3 (major chord, soft)
    createDrone(130.8, 'sine', 0.25, 6);   // C3
    createDrone(164.8, 'sine', 0.15, 8);   // E3
    createDrone(196.0, 'sine', 0.18, 7);   // G3

    // High shimmer — C5 + G5 (very quiet)
    createDrone(523.3, 'sine', 0.04, 12);  // C5 sparkle
    createDrone(784.0, 'sine', 0.02, 15);  // G5 air

    // Filtered noise for texture
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 200;
    noiseFilter.Q.value = 1;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.08;

    // Modulate filter for sweeping texture
    const filterLfo = ctx.createOscillator();
    const filterLfoGain = ctx.createGain();
    filterLfo.type = 'sine';
    filterLfo.frequency.value = 0.02;
    filterLfoGain.gain.value = 150;
    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(noiseFilter.frequency);
    filterLfo.start();

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start();

    nodesRef.current.push(filterLfo);
  }, []);

  // Start on first user interaction (browsers require gesture)
  useEffect(() => {
    const handleInteraction = () => {
      startAmbient();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [startAmbient]);

  // Duck volume during narration, restore after
  useEffect(() => {
    const gain = masterGainRef.current;
    if (!gain) return;

    const target = muted ? 0 : isNarrating ? DUCK_VOLUME : BASE_VOLUME;
    gain.gain.setTargetAtTime(target, gain.context.currentTime, 0.8);
  }, [isNarrating, muted]);

  // Cleanup
  useEffect(() => {
    return () => {
      nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
      ctxRef.current?.close();
    };
  }, []);

  return null; // No UI — pure audio
}
