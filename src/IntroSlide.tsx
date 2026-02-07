import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import type { IntroSlideProps } from "./types";

export const IntroSlide: React.FC<IntroSlideProps> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in over first second
  const opacity = interpolate(frame, [0, fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Scale up slightly from 0.8 to 1
  const scale = interpolate(frame, [0, fps * 1.5], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  // Gentle glow pulse
  const glowIntensity = interpolate(
    frame,
    [0, fps * 2, fps * 4],
    [0, 30, 20],
    { extrapolateRight: "clamp" }
  );

  // Split text into two lines for staggered reveal
  const words = text.trim().split(/\s+/).filter(Boolean);
  const splitIndex = Math.max(1, Math.ceil(words.length / 2));
  const headline = words.slice(0, splitIndex).join(" ");
  const subhead = words.slice(splitIndex).join(" ");

  // Staggered line reveal
  const line1Opacity = interpolate(frame, [fps * 0.3, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const line2Opacity = interpolate(frame, [fps * 0.8, fps * 1.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const line1Y = interpolate(frame, [fps * 0.3, fps * 0.8], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const line2Y = interpolate(frame, [fps * 0.8, fps * 1.3], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            color: "#fff",
            fontSize: 90,
            fontFamily: "Georgia, serif",
            fontWeight: "bold",
            textAlign: "center",
            textShadow: `0 0 ${glowIntensity}px rgba(255, 200, 100, 0.8), 0 0 ${glowIntensity * 2}px rgba(255, 150, 50, 0.4)`,
            opacity: line1Opacity,
            transform: `translateY(${line1Y}px)`,
          }}
        >
          {headline}
        </div>
        {subhead.length > 0 ? (
          <div
            style={{
              color: "#ffd700",
              fontSize: 120,
              fontFamily: "Georgia, serif",
              fontWeight: "bold",
              textAlign: "center",
              textShadow: `0 0 ${glowIntensity}px rgba(255, 215, 0, 0.9), 0 0 ${glowIntensity * 2}px rgba(255, 180, 0, 0.5)`,
              opacity: line2Opacity,
              transform: `translateY(${line2Y}px)`,
            }}
          >
            {subhead}
          </div>
        ) : null}
      </div>

      {/* Decorative particles */}
      {Array.from({ length: 20 }).map((_, i) => {
        const particleDelay = i * 0.1;
        const particleOpacity = interpolate(
          frame,
          [fps * particleDelay, fps * (particleDelay + 0.5)],
          [0, 0.6],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const particleY = interpolate(
          frame,
          [fps * particleDelay, fps * 5],
          [1920 + 50, -50],
          { extrapolateLeft: "clamp" }
        );
        const particleX = 100 + (i * 47) % 880;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: particleX,
              top: particleY,
              width: 8 + (i % 5) * 3,
              height: 8 + (i % 5) * 3,
              borderRadius: "50%",
              background: i % 2 === 0 ? "#ffd700" : "#fff",
              opacity: particleOpacity * (0.3 + (i % 5) * 0.15),
              boxShadow: `0 0 ${10 + (i % 3) * 5}px ${i % 2 === 0 ? "#ffd700" : "#fff"}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
