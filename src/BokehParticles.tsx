import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { VIDEO_CONFIG } from "./types";

interface BokehParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  blur: number;
  opacity: number;
}

interface BokehParticlesProps {
  particleCount?: number;
  seed?: number;
}

// Seeded random for deterministic renders
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

// Warm color palette
const COLORS = [
  "rgba(255, 215, 0, 0.6)",   // gold
  "rgba(255, 182, 193, 0.5)", // pink
  "rgba(255, 255, 255, 0.4)", // white
  "rgba(255, 200, 150, 0.5)", // peach
  "rgba(200, 180, 255, 0.4)", // soft lavender
];

export const BokehParticles: React.FC<BokehParticlesProps> = ({
  particleCount = 20,
  seed = 42,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = VIDEO_CONFIG;

  // Generate particles once with seeded random
  const particles = useMemo<BokehParticle[]>(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      const s = seed + i * 137;
      return {
        id: i,
        x: seededRandom(s) * width,
        y: seededRandom(s + 1) * height,
        vx: (seededRandom(s + 2) - 0.5) * 1.5,
        vy: (seededRandom(s + 3) - 0.5) * 1.2,
        size: 30 + seededRandom(s + 4) * 60,
        color: COLORS[Math.floor(seededRandom(s + 5) * COLORS.length) % COLORS.length]!,
        blur: 12 + seededRandom(s + 6) * 15,
        opacity: 0.15 + seededRandom(s + 7) * 0.25,
      };
    });
  }, [particleCount, seed, width, height]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {particles.map((particle) => {
        // Calculate position based on frame
        let x = particle.x + particle.vx * frame;
        let y = particle.y + particle.vy * frame;

        // Wrap around screen edges with padding
        const padding = particle.size;
        x = ((x + padding) % (width + padding * 2)) - padding;
        y = ((y + padding) % (height + padding * 2)) - padding;

        // Handle negative wrap
        if (x < -padding) x += width + padding * 2;
        if (y < -padding) y += height + padding * 2;

        // Subtle breathing effect
        const breathe = interpolate(
          Math.sin((frame + particle.id * 30) * 0.02),
          [-1, 1],
          [0.8, 1.2]
        );

        return (
          <div
            key={particle.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: particle.size * breathe,
              height: particle.size * breathe,
              borderRadius: "50%",
              backgroundColor: particle.color,
              filter: `blur(${particle.blur}px)`,
              opacity: particle.opacity,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
