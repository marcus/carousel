import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

interface FilmGrainOverlayProps {
  opacity?: number;
}

export const FilmGrainOverlay: React.FC<FilmGrainOverlayProps> = ({
  opacity = 0.04,
}) => {
  const frame = useCurrentFrame();

  // Animate the seed to create moving grain effect
  const seed = frame % 100;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="film-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              seed={seed}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: "url(#film-grain)",
          opacity,
          mixBlendMode: "overlay",
        }}
      />
    </AbsoluteFill>
  );
};
