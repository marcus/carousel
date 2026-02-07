import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { SpotlightBackgroundProps, SpotlightPreset } from "./types";
import { VIDEO_CONFIG } from "./types";

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

interface PresetConfig {
  bgGradient: string;
  spotlightColors: string[];
}

const PRESETS: Record<SpotlightPreset, PresetConfig> = {
  "warm-sunset": {
    bgGradient: "linear-gradient(135deg, #1a0a2e 0%, #3d1c56 50%, #5c2d82 100%)",
    spotlightColors: [
      "rgba(255,140,50,0.4)",
      "rgba(255,80,80,0.3)",
      "rgba(255,200,100,0.25)",
    ],
  },
  "cool-ocean": {
    bgGradient: "linear-gradient(135deg, #0a1628 0%, #1a3a5c 50%, #2a5a8c 100%)",
    spotlightColors: [
      "rgba(100,200,255,0.35)",
      "rgba(50,150,220,0.3)",
      "rgba(150,230,255,0.2)",
    ],
  },
  "dreamy-purple": {
    bgGradient: "linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #4a2d7a 100%)",
    spotlightColors: [
      "rgba(200,130,255,0.35)",
      "rgba(255,100,200,0.3)",
      "rgba(150,100,255,0.25)",
    ],
  },
  "golden-hour": {
    bgGradient: "linear-gradient(135deg, #1a1005 0%, #3d2a10 50%, #5c3d15 100%)",
    spotlightColors: [
      "rgba(255,200,80,0.4)",
      "rgba(255,160,50,0.3)",
      "rgba(255,220,130,0.25)",
    ],
  },
  "forest-green": {
    bgGradient: "linear-gradient(135deg, #0a1a0a 0%, #1a3d1a 50%, #2a5c2a 100%)",
    spotlightColors: [
      "rgba(100,255,150,0.3)",
      "rgba(50,200,100,0.25)",
      "rgba(150,255,200,0.2)",
    ],
  },
  "rose-gold": {
    bgGradient: "linear-gradient(135deg, #2e1a1a 0%, #4e2d2d 50%, #6e3d3d 100%)",
    spotlightColors: [
      "rgba(255,180,180,0.35)",
      "rgba(255,200,150,0.3)",
      "rgba(255,150,200,0.25)",
    ],
  },
  "midnight-blue": {
    bgGradient: "linear-gradient(135deg, #050a1a 0%, #0a1a3d 50%, #102a5c 100%)",
    spotlightColors: [
      "rgba(80,120,255,0.35)",
      "rgba(100,150,255,0.3)",
      "rgba(150,200,255,0.2)",
    ],
  },
  "cotton-candy": {
    bgGradient: "linear-gradient(135deg, #2e1a2e 0%, #3d1a3d 50%, #4a2a5c 100%)",
    spotlightColors: [
      "rgba(255,150,200,0.35)",
      "rgba(150,200,255,0.3)",
      "rgba(255,200,255,0.25)",
    ],
  },
};

interface OrbConfig {
  id: number;
  color: string;
  size: number;
  blur: number;
  orbitRadiusX: number;
  orbitRadiusY: number;
  speed: number;
  phase: number;
  baseOpacity: number;
}

export const SpotlightBackground: React.FC<SpotlightBackgroundProps> = ({
  preset,
  seed = 42,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = VIDEO_CONFIG;
  const config = PRESETS[preset];
  const centerX = width / 2;
  const centerY = height / 2;

  const orbs = useMemo<OrbConfig[]>(() => {
    return config.spotlightColors.map((color, i) => {
      const s = seed + i * 137;
      return {
        id: i,
        color,
        size: 300 + seededRandom(s) * 200,
        blur: 80 + seededRandom(s + 1) * 40,
        orbitRadiusX: 200 + seededRandom(s + 2) * 300,
        orbitRadiusY: 150 + seededRandom(s + 3) * 250,
        speed: 0.005 + seededRandom(s + 4) * 0.01,
        phase: seededRandom(s + 5) * Math.PI * 2,
        baseOpacity: 0.8 + seededRandom(s + 6) * 0.2,
      };
    });
  }, [config.spotlightColors, seed]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: config.bgGradient,
        }}
      />
      {orbs.map((orb) => {
        const x =
          centerX + Math.cos(frame * orb.speed + orb.phase) * orb.orbitRadiusX;
        const y =
          centerY +
          Math.sin(frame * orb.speed * 0.7 + orb.phase) * orb.orbitRadiusY;
        const breathe =
          orb.baseOpacity + Math.sin(frame * 0.02 + orb.phase) * 0.1;

        return (
          <div
            key={orb.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: orb.size,
              height: orb.size,
              borderRadius: "50%",
              backgroundColor: orb.color,
              filter: `blur(${orb.blur}px)`,
              opacity: breathe,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
