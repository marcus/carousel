import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { VIDEO_CONFIG } from "./types";

interface ConfettiParticle {
  id: number;
  x: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  width: number;
  height: number;
}

interface ConfettiBurstProps {
  triggers: number[]; // Frame numbers when bursts occur
  burstDuration?: number; // Frames per burst
  particlesPerBurst?: number;
}

// Seeded random
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

// Celebration colors
const COLORS = [
  "#FF6B6B", // coral red
  "#4ECDC4", // teal
  "#FFD93D", // gold
  "#6BCB77", // green
  "#FF8ED4", // pink
  "#A66CFF", // purple
  "#61C0BF", // cyan
  "#F9A826", // orange
];

const GRAVITY = 0.35;

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({
  triggers,
  burstDuration = 120,
  particlesPerBurst = 250,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = VIDEO_CONFIG;

  // Generate particles for each trigger — spread across full screen width
  const bursts = useMemo(() => {
    return triggers.map((triggerFrame) => {
      const particles: ConfettiParticle[] = Array.from(
        { length: particlesPerBurst },
        (_, i) => {
          const seed = triggerFrame * 1000 + i;
          // Launch from multiple points across the full width
          const launchX = seededRandom(seed) * width;
          return {
            id: i,
            x: launchX,
            vx: (seededRandom(seed + 1) - 0.5) * 24,
            vy: -12 - seededRandom(seed + 2) * 18, // Strong upward burst
            rotation: seededRandom(seed + 3) * 360,
            rotationSpeed: (seededRandom(seed + 4) - 0.5) * 20,
            color:
              COLORS[
                Math.floor(seededRandom(seed + 5) * COLORS.length) %
                  COLORS.length
              ]!,
            width: 10 + seededRandom(seed + 6) * 14,
            height: 18 + seededRandom(seed + 7) * 22,
          };
        }
      );
      return { triggerFrame, particles };
    });
  }, [triggers, particlesPerBurst, width]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {bursts.map((burst, burstIndex) => {
        const burstFrame = frame - burst.triggerFrame;

        // Only render if burst is active
        if (burstFrame < 0 || burstFrame > burstDuration) {
          return null;
        }

        // Fade out in last portion
        const fadeOutStart = burstDuration - 40;
        const opacity = interpolate(
          burstFrame,
          [fadeOutStart, burstDuration],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <React.Fragment key={burstIndex}>
            {burst.particles.map((particle) => {
              // Physics simulation
              const x = particle.x + particle.vx * burstFrame;
              const y =
                height * 0.5 + // Launch from middle of screen
                particle.vy * burstFrame +
                0.5 * GRAVITY * burstFrame * burstFrame;
              const rotation =
                particle.rotation + particle.rotationSpeed * burstFrame;

              // Don't render if off screen
              if (y > height + 50 || x < -50 || x > width + 50) {
                return null;
              }

              return (
                <div
                  key={particle.id}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    width: particle.width,
                    height: particle.height,
                    backgroundColor: particle.color,
                    borderRadius: 2,
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                    opacity,
                  }}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
