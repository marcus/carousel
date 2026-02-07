import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import type { TextOverlayProps, TextEffect } from "./types";
import { VIDEO_CONFIG } from "./types";
import { WhiteGlowEffect } from "./text-effects/WhiteGlowEffect";
import { SolidStrokeEffect } from "./text-effects/SolidStrokeEffect";
import { GradientOutlineEffect } from "./text-effects/GradientOutlineEffect";
import { FrostedPillEffect } from "./text-effects/FrostedPillEffect";
import { CleanGradientEffect } from "./text-effects/CleanGradientEffect";
import { DuoToneEffect } from "./text-effects/DuoToneEffect";

// Predefined gradient color schemes for reusable overlays
export const GRADIENT_SCHEMES = [
  { colors: ["#FF9A9E", "#FECFEF"], name: "blush" },         // Soft coral to pink
  { colors: ["#A8EDEA", "#FED6E3"], name: "mint-pink" },     // Mint to soft pink
  { colors: ["#D299FF", "#FF9CE6"], name: "lavender" },      // Light purple to pink
  { colors: ["#89F7FE", "#66A6FF"], name: "sky" },           // Bright cyan to blue
  { colors: ["#FFE985", "#FA742B"], name: "sunshine" },      // Bright yellow to orange
  { colors: ["#96FBC4", "#74EBD5"], name: "seafoam" },       // Bright mint to teal
  { colors: ["#FF9CEE", "#C8B6FF"], name: "candy" },         // Hot pink to lavender
  { colors: ["#FFF59D", "#FFD54F"], name: "lemon" },         // Bright yellow
];

const HORIZONTAL_MARGIN = 80;
const AVAILABLE_WIDTH = VIDEO_CONFIG.width - (HORIZONTAL_MARGIN * 2);
const MAX_HEIGHT = 400;
const MAX_FONT_SIZE = 140;
const MIN_FONT_SIZE = 44;

// Calculate optimal font size ensuring no word breaks mid-word
const calculateFontSize = (text: string): number => {
  // Bold weight 800 Poppins is very wide — generous ratio to prevent overflow
  const charWidthRatio = 0.82;
  const words = text.split(/\s+/);
  const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b), "");

  for (let fontSize = MAX_FONT_SIZE; fontSize >= MIN_FONT_SIZE; fontSize -= 4) {
    // Account for letter-spacing (effects use 2-3px)
    const estimatedCharWidth = fontSize * charWidthRatio + 3;

    // Longest word must fit on a single line
    const longestWordWidth = longestWord.length * estimatedCharWidth;
    if (longestWordWidth > AVAILABLE_WIDTH) continue;

    // Estimate line wrapping word-by-word
    let lines = 1;
    let currentLineWidth = 0;
    const spaceWidth = estimatedCharWidth * 0.35;

    for (const word of words) {
      const wordWidth = word.length * estimatedCharWidth;
      if (currentLineWidth === 0) {
        currentLineWidth = wordWidth;
      } else if (currentLineWidth + spaceWidth + wordWidth <= AVAILABLE_WIDTH) {
        currentLineWidth += spaceWidth + wordWidth;
      } else {
        lines++;
        currentLineWidth = wordWidth;
      }
    }

    const lineHeight = fontSize * 1.2;
    if (lines * lineHeight <= MAX_HEIGHT) {
      return fontSize;
    }
  }

  return MIN_FONT_SIZE;
};

const EFFECT_COMPONENTS: Record<TextEffect, React.FC<{
  text: string;
  fontSize: number;
  gradientColors: string[];
  opacity: number;
  translateY: number;
}>> = {
  "white-glow": WhiteGlowEffect,
  "solid-stroke": SolidStrokeEffect,
  "gradient-outline": GradientOutlineEffect,
  "frosted-pill": FrostedPillEffect,
  "clean-gradient": CleanGradientEffect,
  "duo-tone": DuoToneEffect,
};

// Default effect cycle when no explicit effect is set
const DEFAULT_EFFECTS: TextEffect[] = [
  "white-glow",
  "solid-stroke",
  "gradient-outline",
  "frosted-pill",
  "clean-gradient",
  "duo-tone",
];

export const TextOverlay: React.FC<TextOverlayProps> = ({
  text,
  colorSchemeIndex = 0,
  textEffect,
  fadeInDuration = 15,
  fadeOutDuration = 15,
  holdDuration,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Calculate timing
  const effectiveHoldDuration = holdDuration ?? (durationInFrames - startFrame - fadeInDuration - fadeOutDuration);
  const totalDuration = fadeInDuration + effectiveHoldDuration + fadeOutDuration;
  const endFrame = startFrame + totalDuration;

  // Get frame relative to overlay start
  const relativeFrame = frame - startFrame;

  // Don't render if before start or after end
  if (frame < startFrame || frame > endFrame) {
    return null;
  }

  // Calculate opacity with smooth easing
  let opacity = 0;
  if (relativeFrame < fadeInDuration) {
    opacity = interpolate(
      relativeFrame,
      [0, fadeInDuration],
      [0, 1],
      { easing: Easing.out(Easing.cubic) }
    );
  } else if (relativeFrame < fadeInDuration + effectiveHoldDuration) {
    opacity = 1;
  } else {
    opacity = interpolate(
      relativeFrame,
      [fadeInDuration + effectiveHoldDuration, totalDuration],
      [1, 0],
      { easing: Easing.in(Easing.cubic) }
    );
  }

  // Subtle slide up animation during fade in
  const translateY = interpolate(
    relativeFrame,
    [0, fadeInDuration],
    [20, 0],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Get gradient colors
  const schemeIndex = colorSchemeIndex % GRADIENT_SCHEMES.length;
  const defaultColors = ["#FF6B6B", "#FFE66D"];
  const gradientColors = GRADIENT_SCHEMES[schemeIndex]?.colors ?? defaultColors;

  // Calculate optimal font size
  const fontSize = calculateFontSize(text);

  // Pick effect: explicit, or cycle through defaults based on colorSchemeIndex
  const effect = textEffect ?? DEFAULT_EFFECTS[colorSchemeIndex % DEFAULT_EFFECTS.length]!;
  const EffectComponent = EFFECT_COMPONENTS[effect];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 180,
        left: HORIZONTAL_MARGIN,
        right: HORIZONTAL_MARGIN,
        maxHeight: MAX_HEIGHT,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
      }}
    >
      <EffectComponent
        text={text}
        fontSize={fontSize}
        gradientColors={gradientColors}
        opacity={opacity}
        translateY={translateY}
      />
    </div>
  );
};
