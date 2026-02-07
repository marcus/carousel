import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Easing } from "remotion";

interface TextEffectProps {
  text: string;
  fontSize: number;
  gradientColors: string[];
  opacity: number;
  translateY: number;
}

const isEmojiOnly = (str: string): boolean => {
  const emojiRegex =
    /^[\s\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]+$/u;
  return emojiRegex.test(str.trim());
};

export const DuoToneEffect: React.FC<TextEffectProps> = ({
  text,
  fontSize,
  gradientColors,
  opacity,
  translateY,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const emoji = isEmojiOnly(text);

  // Playful spring scale — pops in with overshoot
  const scaleSpring = spring({
    frame,
    fps,
    config: {
      damping: 8,
      stiffness: 120,
      mass: 0.6,
    },
  });

  // Shadow offset animates from a big offset down to the final 5px — "landing" effect
  const shadowOffset = interpolate(
    spring({
      frame,
      fps,
      config: {
        damping: 10,
        stiffness: 100,
        mass: 0.8,
      },
    }),
    [0, 1],
    [22, 5]
  );

  // Bounce rotation: starts tilted, settles to 0
  const rotation = interpolate(
    spring({
      frame,
      fps,
      config: {
        damping: 9,
        stiffness: 140,
        mass: 0.5,
      },
    }),
    [0, 1],
    [-8, 0]
  );

  // Slight vertical bounce layered on top of parent translateY
  const bounceY = interpolate(
    spring({
      frame,
      fps,
      config: {
        damping: 7,
        stiffness: 160,
        mass: 0.4,
      },
    }),
    [0, 1],
    [-18, 0]
  );

  if (emoji) {
    return (
      <div
        style={{
          opacity,
          transform: `translateY(${translateY + bounceY}px) scale(${scaleSpring}) rotate(${rotation}deg)`,
          filter: "drop-shadow(0 4px 15px rgba(0,0,0,0.15))",
        }}
      >
        <div
          style={{
            textAlign: "center",
            width: "100%",
            wordWrap: "normal",
            overflowWrap: "normal",
            wordBreak: "keep-all",
            fontSize: fontSize * 1.5,
            lineHeight: 1.2,
          }}
        >
          {text}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY + bounceY}px)`,
      }}
    >
      <div
        style={{
          textAlign: "center",
          width: "100%",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          transform: `scale(${scaleSpring}) rotate(${rotation}deg)`,
          filter: "drop-shadow(0 4px 15px rgba(0,0,0,0.1))",
        }}
      >
        <span
          style={{
            fontFamily: "'Poppins', 'Montserrat', sans-serif",
            fontWeight: 800,
            fontSize,
            color: "#FFFFFF",
            letterSpacing: 2,
            textShadow: `${shadowOffset}px ${shadowOffset}px 0 ${gradientColors[0]}`,
            lineHeight: 1.2,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
