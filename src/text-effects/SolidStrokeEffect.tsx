import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Easing } from "remotion";

interface TextEffectProps {
  text: string;
  fontSize: number;
  gradientColors: string[];
  opacity: number;
  translateY: number;
}

const isEmojiOnly = (text: string): boolean => {
  const withoutEmoji = text
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\s]/gu,
      ""
    )
    .trim();
  return withoutEmoji.length === 0 && text.trim().length > 0;
};

export const SolidStrokeEffect: React.FC<TextEffectProps> = ({
  text,
  fontSize,
  gradientColors,
  opacity,
  translateY,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const emojiOnly = isEmojiOnly(text);

  // Entrance: swing in from tilted left with a bouncy spring
  const rotateSpring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 120, mass: 0.6 },
  });
  const rotate = interpolate(rotateSpring, [0, 1], [-8, 0]);

  // Scale bounce with overshoot
  const scaleSpring = spring({
    frame,
    fps,
    config: { damping: 7, stiffness: 150, mass: 0.5 },
  });
  const scale = interpolate(scaleSpring, [0, 1], [0.3, 1]);

  // Slight horizontal slide-in
  const slideX = interpolate(
    spring({ frame, fps, config: { damping: 10, stiffness: 100, mass: 0.5 } }),
    [0, 1],
    [-40, 0]
  );

  const strokeWidth = fontSize > 60 ? 3 : 2;

  const wrapperStyle: React.CSSProperties = {
    opacity,
    transform: `translateY(${translateY}px)`,
    textAlign: "center" as const,
    width: "100%",
    wordWrap: "normal",
    overflowWrap: "normal",
    wordBreak: "keep-all",
  };

  const innerStyle: React.CSSProperties = {
    display: "inline-block",
    transform: `rotate(${rotate}deg) scale(${scale}) translateX(${slideX}px)`,
  };

  if (emojiOnly) {
    return (
      <div style={wrapperStyle}>
        <div style={innerStyle}>
          <span
            style={{
              fontSize: fontSize * 1.5,
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))",
              lineHeight: 1.2,
            }}
          >
            {text}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <div style={innerStyle}>
        <span
          style={{
            fontSize,
            fontFamily: "'Poppins', 'Montserrat', sans-serif",
            fontWeight: 900,
            color: gradientColors[0],
            WebkitTextStroke: `${strokeWidth}px white`,
            paintOrder: "stroke fill",
            letterSpacing: 3,
            textShadow: "0 2px 12px rgba(0,0,0,0.12)",
            lineHeight: 1.2,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
