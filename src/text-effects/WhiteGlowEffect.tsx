import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface TextEffectProps {
  text: string;
  fontSize: number;
  gradientColors: string[];
  opacity: number;
  translateY: number;
}

const isEmojiOnly = (str: string): boolean => {
  const stripped = str.replace(/[\s]/g, "");
  const emojiRegex =
    /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Component})+$/u;
  return stripped.length > 0 && emojiRegex.test(stripped);
};

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const WhiteGlowEffect: React.FC<TextEffectProps> = ({
  text,
  fontSize,
  gradientColors,
  opacity,
  translateY,
}) => {
  const frame = useCurrentFrame();
  const glowColor = gradientColors[0] || "#FF9A9E";

  // Gentle sine pulse for glow intensity (cycles every ~2 seconds at 30fps)
  const pulse = Math.sin(frame * 0.1) * 0.15 + 1; // oscillates 0.85 - 1.15

  // Entrance: glow blooms from zero over first 20 frames
  const glowBloom = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Entrance: shimmer sweep — a bright highlight that moves left-to-right
  const shimmerProgress = interpolate(frame, [5, 30], [-20, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Per-letter stagger scale entrance
  const letters = text.split("");

  if (isEmojiOnly(text)) {
    return (
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          textAlign: "center",
          width: "100%",
          wordWrap: "normal",
          overflowWrap: "normal",
          wordBreak: "keep-all",
          fontSize: fontSize * 1.5,
          lineHeight: 1.2,
          filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.3))`,
        }}
      >
        {text}
      </div>
    );
  }

  const blurBase = fontSize * 0.15;

  const textShadow = [
    `0 0 ${blurBase * 0.5 * pulse * glowBloom}px ${hexToRgba(glowColor, 0.9 * glowBloom)}`,
    `0 0 ${blurBase * 1.0 * pulse * glowBloom}px ${hexToRgba(glowColor, 0.7 * glowBloom)}`,
    `0 0 ${blurBase * 2.0 * pulse * glowBloom}px ${hexToRgba(glowColor, 0.5 * glowBloom)}`,
    `0 0 ${blurBase * 3.0 * pulse * glowBloom}px ${hexToRgba(glowColor, 0.3 * glowBloom)}`,
    `0 0 ${blurBase * 4.5 * pulse * glowBloom}px ${hexToRgba(glowColor, 0.15 * glowBloom)}`,
  ].join(", ");

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        textAlign: "center",
        width: "100%",
        wordWrap: "break-word",
        overflowWrap: "break-word",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "inline-block",
          fontSize,
          fontFamily: "'Poppins', 'Montserrat', sans-serif",
          fontWeight: 800,
          color: "#FFFFFF",
          letterSpacing: 2,
          lineHeight: 1.2,
          textShadow,
        }}
      >
        {letters.map((letter, i) => {
          // Staggered scale-up per letter
          const delay = i * 2;
          const letterScale = interpolate(frame, [delay, delay + 15], [0.3, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(1.4)),
          });
          const letterOpacity = interpolate(frame, [delay, delay + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          // Shimmer: bright flash as the sweep crosses this letter's position
          const letterCenter = (i / Math.max(letters.length - 1, 1)) * 100;
          const distFromShimmer = Math.abs(shimmerProgress - letterCenter);
          const shimmerBrightness = distFromShimmer < 15 ? 1 + (1 - distFromShimmer / 15) * 0.6 : 1;

          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                transform: `scale(${letterScale})`,
                opacity: letterOpacity,
                filter: `brightness(${shimmerBrightness})`,
                whiteSpace: letter === " " ? "pre" : undefined,
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>
    </div>
  );
};
