import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

interface VignetteOverlayProps {
  opacity?: number;
  breathe?: boolean;
}

export const VignetteOverlay: React.FC<VignetteOverlayProps> = ({
  opacity = 0.12,
  breathe = true,
}) => {
  const frame = useCurrentFrame();

  // Subtle breathing animation
  const breatheOpacity = breathe
    ? interpolate(Math.sin(frame * 0.015), [-1, 1], [opacity * 0.8, opacity * 1.1])
    : opacity;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(
          ellipse at center,
          transparent 40%,
          rgba(0, 0, 0, 0.5) 100%
        )`,
        opacity: breatheOpacity,
      }}
    />
  );
};
