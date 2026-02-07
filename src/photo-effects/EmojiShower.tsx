import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import type { EmojiShowerConfig } from "../types";
import { VIDEO_CONFIG } from "../types";

// Seeded pseudo-random for deterministic particle positions
const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

interface Particle {
  id: number;
  // Normalized 0-1 starting position
  startX: number;
  startY: number;
  // Per-particle variation
  speed: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  delay: number; // stagger within the effect
  // Zigzag-specific
  zigFreq: number;
  zigAmp: number;
  // Firework-specific
  angle: number;
  distance: number;
}

const generateParticles = (
  count: number,
  pattern: EmojiShowerConfig["pattern"],
  seed: number,
): Particle[] => {
  const rand = seededRandom(seed);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: rand(),
    startY: pattern === "rain" ? -0.1 : pattern === "firework" ? 0.5 : rand(),
    speed: 0.7 + rand() * 0.6,
    size: 0.7 + rand() * 0.6,
    rotation: rand() * 360,
    rotationSpeed: (rand() - 0.5) * 400,
    delay: rand() * 0.35,
    zigFreq: 2 + rand() * 4,
    zigAmp: 0.03 + rand() * 0.08,
    angle: (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.4,
    distance: 0.3 + rand() * 0.7,
  }));
};

const getRainPosition = (
  particle: Particle,
  progress: number, // 0-1 for this particle
) => {
  const x = particle.startX + Math.sin(progress * 3 + particle.id) * 0.05;
  // Stagger vertical start so particles spread across the full height
  const yOffset = particle.startY * 0.4; // use startY as vertical stagger (0-0.4)
  const y = -0.25 - yOffset + progress * 1.7;
  return { x, y };
};

const getFireworkPosition = (
  particle: Particle,
  progress: number,
  burstX: number,
  burstY: number,
) => {
  // Ease out for deceleration
  const eased = 1 - Math.pow(1 - progress, 2.5);
  const dist = particle.distance * eased;
  const x = burstX + Math.cos(particle.angle) * dist * 0.5;
  const y = burstY + Math.sin(particle.angle) * dist * 0.8 + progress * 0.15; // gravity
  return { x, y };
};

const getZigzagPosition = (
  particle: Particle,
  progress: number,
) => {
  const baseX = particle.startX;
  const baseY = -0.15 + progress * 1.3;
  const zigOffset = Math.sin(progress * particle.zigFreq * Math.PI * 2) * particle.zigAmp;
  return { x: baseX + zigOffset, y: baseY };
};

export const EmojiShower: React.FC<EmojiShowerConfig> = ({
  emoji,
  pattern,
  count = 24,
  durationInSeconds = 1.5,
  startDelayFrames = 8,
  emojiSize = 160,
  burstX = 0.5,
  burstY = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const durationFrames = Math.round(durationInSeconds * fps);
  const totalFrames = startDelayFrames + durationFrames;

  const particles = useMemo(
    () => generateParticles(count, pattern, emoji.charCodeAt(0) * 137 + count),
    [count, pattern, emoji],
  );

  // Global progress
  const globalProgress = interpolate(
    frame,
    [startDelayFrames, startDelayFrames + durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Fade out at the very end
  const fadeOut = interpolate(
    frame,
    [startDelayFrames + durationFrames * 0.75, totalFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Entrance punch for firework
  const fireworkEntrance = pattern === "firework"
    ? interpolate(frame, [startDelayFrames, startDelayFrames + 6], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 1;

  if (frame < startDelayFrames || globalProgress <= 0) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {particles.map((p) => {
        // Per-particle progress with stagger
        const pProgress = interpolate(
          globalProgress,
          [p.delay, 1],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        if (pProgress <= 0) return null;

        let pos: { x: number; y: number };
        switch (pattern) {
          case "rain":
            pos = getRainPosition(p, pProgress);
            break;
          case "firework":
            pos = getFireworkPosition(p, pProgress, burstX, burstY);
            break;
          case "zigzag":
            pos = getZigzagPosition(p, pProgress);
            break;
        }

        const pixelX = pos.x * VIDEO_CONFIG.width;
        const pixelY = pos.y * VIDEO_CONFIG.height;
        const pSize = emojiSize * p.size;
        const rot = p.rotation + pProgress * p.rotationSpeed;

        // Per-particle opacity: quick entrance then follow global fadeout
        const pEntrance = interpolate(pProgress, [0, 0.15], [0, 1], {
          extrapolateRight: "clamp",
        });
        const opacity = pEntrance * fadeOut * fireworkEntrance;

        if (opacity <= 0.01) return null;

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: pixelX - pSize / 2,
              top: pixelY - pSize / 2,
              width: pSize,
              height: pSize,
              fontSize: pSize * 0.85,
              lineHeight: `${pSize}px`,
              textAlign: "center",
              transform: `rotate(${rot}deg) scale(${pattern === "firework" ? fireworkEntrance : 1})`,
              opacity,
              willChange: "transform, opacity",
            }}
          >
            {emoji}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
