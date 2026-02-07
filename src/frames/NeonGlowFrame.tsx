import React, { useState, useEffect } from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  continueRender,
  delayRender,
} from "remotion";
import { TextOverlay } from "../TextOverlay";
import type { ImageData } from "../types";
import { VIDEO_CONFIG } from "../types";

const NEON_COLORS = [
  "#ff2d7b", // Hot pink
  "#00d4ff", // Electric blue
  "#39ff14", // Lime green
  "#ff6b00", // Neon orange
  "#bf00ff", // Purple
];

const hashString = (s: string) =>
  s.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface NeonGlowFrameProps {
  image: ImageData;
  textOverlay?: {
    text: string;
    colorSchemeIndex?: number;
    textEffect?: import("../types").TextEffect;
    startFrame?: number;
  };
}

export const NeonGlowFrame: React.FC<NeonGlowFrameProps> = ({
  image,
  textOverlay,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const [handle] = useState(() => delayRender());
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      continueRender(handle);
    };
    img.onerror = () => {
      setDimensions({ width: 1920, height: 1080 });
      continueRender(handle);
    };
    img.src = staticFile(image.src);
  }, [image.src, handle]);

  if (!dimensions) return null;

  // Pick neon color from image src hash
  const colorIndex = hashString(image.src) % NEON_COLORS.length;
  const neonColor = NEON_COLORS[colorIndex] ?? "#ff2d7b";

  // Photo area sizing (detect from actual loaded dimensions)
  const isPortrait = dimensions.height > dimensions.width;
  const photoWidth = isPortrait ? 780 : 960;
  const photoHeight = isPortrait ? 1040 : 640;

  // Entrance animation: glow expands over first 15 frames
  const entranceProgress = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Neon pulse: sine wave oscillation between 0.8 and 1.2
  const pulse = 0.8 + 0.4 * (0.5 + 0.5 * Math.sin(frame * 0.08));

  // Combine entrance and pulse
  const glowIntensity = entranceProgress * pulse;

  // Flicker effect: every ~90 frames, dip opacity for 3 frames
  const flickerCycle = frame % 90;
  const isFlickering = flickerCycle >= 0 && flickerCycle < 3;
  const flickerOpacity = isFlickering ? 0.85 : 1.0;

  // Build box-shadow with glow intensity
  const boxShadow = [
    `0 0 ${7 * glowIntensity}px ${neonColor}`,
    `0 0 ${20 * glowIntensity}px ${neonColor}`,
    `0 0 ${40 * glowIntensity}px ${hexToRgba(neonColor, 0.5)}`,
    `0 0 ${80 * glowIntensity}px ${hexToRgba(neonColor, 0.3)}`,
    `inset 0 0 ${15 * glowIntensity}px ${hexToRgba(neonColor, 0.2)}`,
  ].join(", ");

  // Neon tube extensions from corners (~50px lines with glow)
  const tubeLength = 65 * entranceProgress;
  const tubeGlow = `0 0 4px ${neonColor}, 0 0 8px ${hexToRgba(neonColor, 0.6)}`;

  const frameLeft = (VIDEO_CONFIG.width - photoWidth) / 2;
  const frameTop = (VIDEO_CONFIG.height - photoHeight) / 2;

  // Corner tube positions
  const tubes = [
    // Top-left horizontal
    { left: frameLeft - tubeLength, top: frameTop, width: tubeLength, height: 2 },
    // Top-left vertical
    { left: frameLeft, top: frameTop - tubeLength, width: 2, height: tubeLength },
    // Top-right horizontal
    { left: frameLeft + photoWidth, top: frameTop, width: tubeLength, height: 2 },
    // Top-right vertical
    { left: frameLeft + photoWidth - 2, top: frameTop - tubeLength, width: 2, height: tubeLength },
    // Bottom-left horizontal
    { left: frameLeft - tubeLength, top: frameTop + photoHeight - 2, width: tubeLength, height: 2 },
    // Bottom-left vertical
    { left: frameLeft, top: frameTop + photoHeight, width: 2, height: tubeLength },
    // Bottom-right horizontal
    { left: frameLeft + photoWidth, top: frameTop + photoHeight - 2, width: tubeLength, height: 2 },
    // Bottom-right vertical
    { left: frameLeft + photoWidth - 2, top: frameTop + photoHeight, width: 2, height: tubeLength },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a0a0a 0%, #1a0a2a 100%)",
      }}
    >
      {/* Neon tube extensions */}
      {tubes.map((tube, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: tube.left,
            top: tube.top,
            width: tube.width,
            height: tube.height,
            backgroundColor: neonColor,
            boxShadow: tubeGlow,
            opacity: flickerOpacity * entranceProgress,
          }}
        />
      ))}

      {/* Photo frame with neon glow */}
      <div
        style={{
          position: "absolute",
          left: frameLeft,
          top: frameTop,
          width: photoWidth,
          height: photoHeight,
          border: `3px solid ${neonColor}`,
          boxShadow,
          opacity: flickerOpacity,
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile(image.src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(1.05)",
          }}
        />
      </div>

      {/* Text overlay */}
      {textOverlay && (
        <TextOverlay
          text={textOverlay.text}
          colorSchemeIndex={textOverlay.colorSchemeIndex}
          textEffect={textOverlay.textEffect}
          startFrame={textOverlay.startFrame}
        />
      )}
    </AbsoluteFill>
  );
};
