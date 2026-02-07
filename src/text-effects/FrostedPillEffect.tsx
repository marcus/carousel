import React from "react";
import {
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from "remotion";

interface TextEffectProps {
  text: string;
  fontSize: number;
  gradientColors: string[];
  opacity: number;
  translateY: number;
}

const isEmojiOnly = (text: string): boolean => {
  const withoutEmoji = text.replace(
    /[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]/gu,
    ""
  );
  return withoutEmoji.length === 0;
};

export const FrostedPillEffect: React.FC<TextEffectProps> = ({
  text,
  fontSize,
  gradientColors,
  opacity,
  translateY,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const emojiOnly = isEmojiOnly(text);
  const displayFontSize = emojiOnly ? fontSize * 1.5 : fontSize;

  // --- Entrance animation: elastic pop-in with blur ramp ---

  // Spring for scale — elastic overshoot gives a satisfying "pop"
  const scaleSpring = spring({
    frame,
    fps,
    config: {
      damping: 8,
      stiffness: 120,
      mass: 0.6,
    },
  });

  // Scale X starts compressed (pill expands from narrow to full)
  const scaleX = interpolate(scaleSpring, [0, 1], [0.3, 1], {
    extrapolateRight: "clamp",
  });

  // Scale Y has a subtler bounce
  const scaleY = interpolate(scaleSpring, [0, 1], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  // Frosted blur animates from 0 to 20px over the first ~12 frames
  const blurAmount = interpolate(frame, [0, 12], [0, 20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Extra internal opacity so the pill fades up on its own too
  const pillOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Derive a subtle tint from the first gradient color
  const tintColor = gradientColors[0] ?? "#96FBC4";

  // Build pill background: white glass + subtle gradient tint
  const pillBackground = `linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.12)
  ), linear-gradient(
    135deg,
    ${tintColor}22,
    ${tintColor}08
  )`;

  const borderRadius = fontSize * 0.6;
  const paddingVertical = fontSize * 0.25;
  const paddingHorizontal = fontSize * 0.5;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `${paddingVertical}px ${paddingHorizontal}px`,
          borderRadius,
          background: pillBackground,
          backdropFilter: `blur(${blurAmount}px)`,
          WebkitBackdropFilter: `blur(${blurAmount}px)`,
          border: "1.5px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
          opacity: pillOpacity,
        }}
      >
        <span
          style={{
            color: "#FFFFFF",
            fontFamily: "'Poppins', 'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: displayFontSize,
            letterSpacing: 1,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
