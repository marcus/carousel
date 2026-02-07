import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

interface TextEffectProps {
  text: string;
  fontSize: number;
  gradientColors: string[];
  opacity: number;
  translateY: number;
}

const isEmojiOnly = (str: string): boolean => {
  const stripped = str.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\s]/gu,
    ""
  );
  return stripped.length === 0 && str.trim().length > 0;
};

export const CleanGradientEffect: React.FC<TextEffectProps> = ({
  text,
  fontSize,
  gradientColors,
  opacity,
  translateY,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const gradientAngle = interpolate(
    frame,
    [0, durationInFrames],
    [135, 225],
    { extrapolateRight: "clamp" }
  );

  // Entrance: scale spring with overshoot + slight rotation settle
  const entranceScale = interpolate(
    frame,
    [0, 6, 12, 18],
    [0.6, 1.08, 0.97, 1],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const entranceRotation = interpolate(
    frame,
    [0, 14],
    [-3, 0],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Gradient sweep: animate background position from left to settled
  const bgPosition = interpolate(
    frame,
    [0, 20],
    [-100, 0],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }
  );

  const emojiOnly = isEmojiOnly(text);

  const wrapperStyle: React.CSSProperties = {
    opacity,
    transform: `translateY(${translateY}px)`,
  };

  if (emojiOnly) {
    return (
      <div style={wrapperStyle}>
        <div
          style={{
            textAlign: "center",
            width: "100%",
            wordWrap: "normal",
            overflowWrap: "normal",
            wordBreak: "keep-all",
            fontSize: fontSize * 1.5,
            lineHeight: 1.2,
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))",
            transform: `scale(${entranceScale}) rotate(${entranceRotation}deg)`,
          }}
        >
          {text}
        </div>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <div
        style={{
          textAlign: "center",
          width: "100%",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          fontSize,
          fontFamily: "'Poppins', 'Montserrat', sans-serif",
          fontWeight: 800,
          letterSpacing: 2,
          lineHeight: 1.2,
          background: `linear-gradient(${gradientAngle}deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
          backgroundSize: "200% 200%",
          backgroundPosition: `${bgPosition + 100}% 50%`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))",
          transform: `scale(${entranceScale}) rotate(${entranceRotation}deg)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};
