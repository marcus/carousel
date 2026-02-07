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
  const emojiRegex =
    /^[\s\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]+$/u;
  return emojiRegex.test(str.trim());
};

export const GradientOutlineEffect: React.FC<TextEffectProps> = ({
  text,
  fontSize,
  gradientColors,
  opacity,
  translateY,
}) => {
  const frame = useCurrentFrame();
  const emoji = isEmojiOnly(text);

  // Entrance: letters pop in with scale, staggered
  const letters = text.split("");
  const perLetterDelay = 2;
  const letterAnimDuration = 12;

  // Shimmer sweep across outline (background-position animation)
  const shimmerX = interpolate(frame, [0, 60], [-100, 200], {
    extrapolateRight: "extend",
  });

  // Overall container fade-in separate from parent opacity
  const entranceFade = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const containerStyle: React.CSSProperties = {
    opacity: opacity * entranceFade,
    transform: `translateY(${translateY}px)`,
    filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.12))",
    textAlign: "center" as const,
    width: "100%",
    wordWrap: "normal",
    overflowWrap: "normal",
    wordBreak: "keep-all",
  };

  if (emoji) {
    return (
      <div style={containerStyle}>
        <span
          style={{
            fontSize: fontSize * 1.5,
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))",
            display: "inline-block",
          }}
        >
          {text}
        </span>
      </div>
    );
  }

  const fontStyle: React.CSSProperties = {
    fontFamily: "'Poppins', 'Montserrat', sans-serif",
    fontWeight: 800,
    fontSize,
    letterSpacing: 2,
    lineHeight: 1.2,
    whiteSpace: "pre-wrap" as const,
  };

  const gradientStr = `linear-gradient(90deg, ${gradientColors.join(", ")})`;

  return (
    <div style={containerStyle}>
      <div style={{ position: "relative", display: "inline-block" }}>
        {/* Back layer: gradient outline via per-letter stagger + shimmer */}
        <span
          aria-hidden
          style={{
            ...fontStyle,
            position: "relative",
            display: "inline",
            color: "transparent",
            WebkitTextStroke: `5px transparent`,
            background: `linear-gradient(90deg, ${gradientColors[0]}, ${gradientColors[gradientColors.length - 1]}, ${gradientColors[0]})`,
            backgroundSize: "200% 100%",
            backgroundPosition: `${shimmerX}% 0`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          {letters.map((letter, i) => {
            const start = i * perLetterDelay;
            const scale = interpolate(
              frame,
              [start, start + letterAnimDuration],
              [0.3, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.back(1.4)),
              }
            );
            const charOpacity = interpolate(
              frame,
              [start, start + letterAnimDuration * 0.5],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  transform: `scale(${scale})`,
                  opacity: charOpacity,
                  // preserve whitespace width
                  minWidth: letter === " " ? "0.3em" : undefined,
                }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            );
          })}
        </span>

        {/* Front layer: white fill on top */}
        <span
          style={{
            ...fontStyle,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            color: "#FFFFFF",
            WebkitTextStroke: "0px transparent",
          }}
        >
          {letters.map((letter, i) => {
            const start = i * perLetterDelay;
            const scale = interpolate(
              frame,
              [start, start + letterAnimDuration],
              [0.3, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.back(1.4)),
              }
            );
            const charOpacity = interpolate(
              frame,
              [start, start + letterAnimDuration * 0.5],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  transform: `scale(${scale})`,
                  opacity: charOpacity,
                  minWidth: letter === " " ? "0.3em" : undefined,
                }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            );
          })}
        </span>
      </div>
    </div>
  );
};
